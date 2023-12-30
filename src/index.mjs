import '@tensorflow/tfjs';

import 'regression';
import params from './params.mjs';
import './dom_util.mjs';
import localforage from 'localforage';
import TFFaceMesh from './facemesh.mjs';
import Reg from './ridgeReg.mjs';
import ridgeRegWeighted from './ridgeWeightedReg.mjs';
import ridgeRegThreaded from './ridgeRegThreaded.mjs';
import util from './util.mjs';

const webgazer = {};
webgazer.tracker = {};
webgazer.tracker.TFFaceMesh = TFFaceMesh;
webgazer.reg = Reg;
webgazer.reg.RidgeWeightedReg = ridgeRegWeighted.RidgeWeightedReg;
webgazer.reg.RidgeRegThreaded = ridgeRegThreaded.RidgeRegThreaded;
webgazer.util = util;
webgazer.params = params;

var videoStream = null;
var videoContainerElement = null;
var videoElement = null;
var videoElementCanvas = null;
var faceOverlay = null;
var faceFeedbackBox = null;
var gazeDot = null;

var debugVideoLoc = '';

var xPast50 = new Array(50);
var yPast50 = new Array(50);

var clockStart = performance.now();
var latestEyeFeatures = null;
var latestGazeData = null;
var paused = false;

var nopCallback = function(data, time) {};
var callback = nopCallback;

var eventTypes = ['click', 'move'];

var moveClock = performance.now();

var curTracker = new webgazer.tracker.TFFaceMesh();
var regs = [new webgazer.reg.RidgeReg()];

var curTrackerMap = {
  'TFFacemesh': function() { return new webgazer.tracker.TFFaceMesh(); },
};
var regressionMap = {
  'ridge': function() { return new webgazer.reg.RidgeReg(); },
  'weightedRidge': function() { return new webgazer.reg.RidgeWeightedReg(); },
  'threadedRidge': function() { return new webgazer.reg.RidgeRegThreaded(); },
};

var localstorageDataLabel = 'webgazerGlobalData';
var localstorageSettingsLabel = 'webgazerGlobalSettings';

var settings = {};
var data = [];
var defaults = {
  'data': [],
  'settings': {}
};

webgazer.computeValidationBoxSize = function() {

  var vw = videoElement.videoWidth;
  var vh = videoElement.videoHeight;
  var pw = parseInt(videoElement.style.width);
  var ph = parseInt(videoElement.style.height);

  var smaller = Math.min( vw, vh );
  var larger  = Math.max( vw, vh );

  var scalar = ( vw == larger ? pw / vw : ph / vh );

  var boxSize = (smaller * webgazer.params.faceFeedbackBoxRatio) * scalar;

  var topVal = (ph - boxSize)/2;
  var leftVal = (pw - boxSize)/2;

  return [topVal, leftVal, boxSize, boxSize]
}

function checkEyesInValidationBox() {

  if (faceFeedbackBox != null && latestEyeFeatures) {
    var w = videoElement.videoWidth;
    var h = videoElement.videoHeight;

    var smaller = Math.min( w, h );
    var boxSize = smaller * webgazer.params.faceFeedbackBoxRatio;

    var topBound = (h - boxSize)/2;
    var leftBound = (w - boxSize)/2;
    var rightBound = leftBound + boxSize;
    var bottomBound = topBound + boxSize;

    var eyeLX = latestEyeFeatures.left.imagex;
    var eyeLY = latestEyeFeatures.left.imagey;
    var eyeRX = latestEyeFeatures.right.imagex;
    var eyeRY = latestEyeFeatures.right.imagey;

    var xPositions = false;
    var yPositions = false;

    if (eyeLX > leftBound && eyeLX + latestEyeFeatures.left.width < rightBound) {
      if (eyeRX > leftBound && eyeRX + latestEyeFeatures.right.width < rightBound) {
        xPositions = true;
      }
    }

    if (eyeLY > topBound && eyeLY + latestEyeFeatures.left.height < bottomBound) {
      if (eyeRY > topBound && eyeRY + latestEyeFeatures.right.height < bottomBound) {
        yPositions = true;
      }
    }

    if (xPositions && yPositions){
      faceFeedbackBox.style.border = 'none';
    } else {
      faceFeedbackBox.style.border = 'none';
    }
  }
  else
    faceFeedbackBox.style.border = 'solid black';
}

function drawCoordinates(colour,x,y){
  var ctx = document.getElementById("plotting_canvas").getContext('2d');
  ctx.fillStyle = colour; 
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2, true);
  ctx.fill();
}

function getPupilFeatures(canvas, width, height) {
  if (!canvas) {
    return;
  }
  try {
    return curTracker.getEyePatches(videoElement, canvas, width, height);
  } catch(err) {
    console.log("can't get pupil features ", err);
    return null;
  }
}

function paintCurrentFrame(canvas, width, height) {
  if (canvas.width != width) {
    canvas.width = width;
  }
  if (canvas.height != height) {
    canvas.height = height;
  }

  var ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
}

async function getPrediction(regModelIndex) {
  var predictions = [];

  latestEyeFeatures = await getPupilFeatures(videoElementCanvas, videoElementCanvas.width, videoElementCanvas.height);

  if (regs.length === 0) {
    console.log('regression not set, call setRegression()');
    return null;
  }
  for (var reg in regs) {
    predictions.push(regs[reg].predict(latestEyeFeatures));
  }
  if (regModelIndex !== undefined) {
    return predictions[regModelIndex] === null ? null : {
      'x' : predictions[regModelIndex].x,
      'y' : predictions[regModelIndex].y,
      'eyeFeatures': latestEyeFeatures
    };
  } else {
    return predictions.length === 0 || predictions[0] === null ? null : {
      'x' : predictions[0].x,
      'y' : predictions[0].y,
      'eyeFeatures': latestEyeFeatures,
      'all' : predictions
    };
  }
}

var smoothingVals = new util.DataWindow(4);
var k = 0;

async function loop() {
  if (!paused) {

    paintCurrentFrame(videoElementCanvas, videoElementCanvas.width, videoElementCanvas.height);

    latestGazeData = getPrediction();

    var elapsedTime = performance.now() - clockStart;

    if( webgazer.params.showFaceOverlay )
    {

      var tracker = webgazer.getTracker();
      faceOverlay.getContext('2d').clearRect( 0, 0, videoElement.videoWidth, videoElement.videoHeight);
      tracker.drawFaceOverlay(faceOverlay.getContext('2d'), tracker.getPositions());
    }

    if( webgazer.params.showFaceFeedbackBox )
      checkEyesInValidationBox();

    latestGazeData = await latestGazeData;

    callback(latestGazeData, elapsedTime);

    if( latestGazeData ) {

      smoothingVals.push(latestGazeData);
      var x = 0;
      var y = 0;
      var len = smoothingVals.length;
      for (var d in smoothingVals.data) {
        x += smoothingVals.get(d).x;
        y += smoothingVals.get(d).y;
      }

      var pred = util.bound({'x':x/len, 'y':y/len});

      if (webgazer.params.storingPoints) {
        drawCoordinates('blue',pred.x,pred.y); 

        webgazer.storePoints(pred.x, pred.y, k);
        k++;
        if (k == 50) {
          k = 0;
        }
      }

      if (webgazer.params.showGazeDot) {
        gazeDot.style.display = 'block';
      }
      gazeDot.style.transform = 'translate3d(' + pred.x + 'px,' + pred.y + 'px,0)';
    } else {
      gazeDot.style.display = 'none';
    }

    requestAnimationFrame(loop);
  }
}

var recordScreenPosition = function(x, y, eventType) {
  if (paused) {
    return;
  }
  if (regs.length === 0) {
    console.log('regression not set, call setRegression()');
    return null;
  }
  for (var reg in regs) {
    if( latestEyeFeatures )
      regs[reg].addData(latestEyeFeatures, [x, y], eventType);
  }
};

var clickListener = async function(event) {
  recordScreenPosition(event.clientX, event.clientY, eventTypes[0]); 

  if (webgazer.params.saveDataAcrossSessions) {

    await setGlobalData();

  }
};

var moveListener = function(event) {
  if (paused) {
    return;
  }

  var now = performance.now();
  if (now < moveClock + webgazer.params.moveTickSize) {
    return;
  } else {
    moveClock = now;
  }
  recordScreenPosition(event.clientX, event.clientY, eventTypes[1]); 
};

var addMouseEventListeners = function() {

  document.addEventListener('click', clickListener, true);
  document.addEventListener('mousemove', moveListener, true);
};

var removeMouseEventListeners = function() {

  document.removeEventListener('click', clickListener, true);
  document.removeEventListener('mousemove', moveListener, true);
};

async function loadGlobalData() {

  settings = await localforage.getItem(localstorageSettingsLabel);
  settings = settings || defaults;

  var loadData = await localforage.getItem(localstorageDataLabel);
  loadData = loadData || defaults;

  data = loadData;

  for (var reg in regs) {
    regs[reg].setData(loadData);
  }

  console.log("loaded stored data into regression model");
}

async function setGlobalData() {

  var storeData = regs[0].getData() || data; 

  localforage.setItem(localstorageSettingsLabel, settings) 
  localforage.setItem(localstorageDataLabel, storeData);

}

function clearData() {

  localforage.clear();

  for (var reg in regs) {
    regs[reg].init();
  }
}

async function init(stream) {

  var topDist = '0px'
  var leftDist = '0px'

  videoStream = stream;

  videoContainerElement = document.createElement('div');
  videoContainerElement.id = webgazer.params.videoContainerId;

  videoContainerElement.style.position = 'fixed';
  videoContainerElement.style.top = topDist;
  videoContainerElement.style.left = leftDist;
  videoContainerElement.style.width = webgazer.params.videoViewerWidth + 'px';
  videoContainerElement.style.height = webgazer.params.videoViewerHeight + 'px';
  hideVideoElement(videoContainerElement);

  videoElement = document.createElement('video');
  videoElement.setAttribute('playsinline', '');
  videoElement.id = webgazer.params.videoElementId;
  videoElement.srcObject = stream;
  videoElement.autoplay = true;
  videoElement.style.position = 'absolute';

  videoElement.style.width = webgazer.params.videoViewerWidth + 'px';
  videoElement.style.height = webgazer.params.videoViewerHeight + 'px';
  hideVideoElement(videoElement);

  videoElementCanvas = document.createElement('canvas');
  videoElementCanvas.id = webgazer.params.videoElementCanvasId;
  videoElementCanvas.style.display = 'none';

  faceOverlay = document.createElement('canvas');
  faceOverlay.id = webgazer.params.faceOverlayId;
  faceOverlay.style.display = webgazer.params.showFaceOverlay ? 'block' : 'none';
  faceOverlay.style.position = 'absolute';

  if (webgazer.params.mirrorVideo) {
    videoElement.style.setProperty("-moz-transform", "scale(-1, 1)");
    videoElement.style.setProperty("-webkit-transform", "scale(-1, 1)");
    videoElement.style.setProperty("-o-transform", "scale(-1, 1)");
    videoElement.style.setProperty("transform", "scale(-1, 1)");
    videoElement.style.setProperty("filter", "FlipH");
    faceOverlay.style.setProperty("-moz-transform", "scale(-1, 1)");
    faceOverlay.style.setProperty("-webkit-transform", "scale(-1, 1)");
    faceOverlay.style.setProperty("-o-transform", "scale(-1, 1)");
    faceOverlay.style.setProperty("transform", "scale(-1, 1)");
    faceOverlay.style.setProperty("filter", "FlipH");
  }

  faceFeedbackBox = document.createElement('canvas');
  faceFeedbackBox.id = webgazer.params.faceFeedbackBoxId;
  faceFeedbackBox.style.display = webgazer.params.showFaceFeedbackBox ? 'block' : 'none';
  faceFeedbackBox.style.border = 'solid';
  faceFeedbackBox.style.position = 'absolute';

  gazeDot = document.createElement('div');
  gazeDot.id = webgazer.params.gazeDotId;
  gazeDot.style.display = webgazer.params.showGazeDot ? 'block' : 'none';
  gazeDot.style.position = 'fixed';
  gazeDot.style.zIndex = 99999;
  gazeDot.style.left = '-5px';
  gazeDot.style.top  = '-5px';
  gazeDot.style.background = 'red';
  gazeDot.style.borderRadius = '100%';
  gazeDot.style.opacity = '0.7';
  gazeDot.style.width = '10px';
  gazeDot.style.height = '10px';

  videoContainerElement.appendChild(videoElement);
  document.body.appendChild(videoContainerElement);
  const videoPreviewSetup = new Promise((res) => {
    function setupPreviewVideo(e) {

      setInternalVideoBufferSizes( videoElement.videoWidth, videoElement.videoHeight );
      webgazer.setVideoViewerSize( webgazer.params.videoViewerWidth, webgazer.params.videoViewerHeight );

      videoContainerElement.appendChild(videoElementCanvas);
      videoContainerElement.appendChild(faceOverlay);
      videoContainerElement.appendChild(faceFeedbackBox);
      document.body.appendChild(gazeDot);

      e.target.removeEventListener(e.type, setupPreviewVideo);
      res();
    };
    videoElement.addEventListener('loadeddata', setupPreviewVideo);
  });

  addMouseEventListeners();

  paused = false;
  clockStart = performance.now();

  await videoPreviewSetup;
  await loop();
}

function setUserMediaVariable(){

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("Unfortunately, your browser does not support access to the webcam through the getUserMedia API. Try to use the latest version of Google Chrome, Mozilla Firefox, Opera, or Microsoft Edge instead."));
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }
}

webgazer.begin = function(onFail) {

  if (webgazer.params.saveDataAcrossSessions) {
    loadGlobalData();
  }

  onFail = onFail || function() {console.log('No stream')};

  if (debugVideoLoc) {
    init(debugVideoLoc);
    return webgazer;
  }

  setUserMediaVariable();

  return new Promise(async (resolve, reject) => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia( webgazer.params.camConstraints );
      await init(stream);
      resolve(webgazer);
    } catch(err) {
      onFail();
      videoElement = null;
      stream = null;
      reject(err);
    }
  });
};

webgazer.isReady = function() {
  if (videoElementCanvas === null) {
    return false;
  }
  return videoElementCanvas.width > 0;
};

webgazer.pause = function() {
  paused = true;
  return webgazer;
};

webgazer.resume = async function() {
  if (!paused) {
    return webgazer;
  }
  paused = false;
  await loop();
  return webgazer;
};

webgazer.end = function() {

  paused = true;

  videoContainerElement.remove();
  gazeDot.remove();

  return webgazer;
};

webgazer.stopVideo = function() {

  videoStream.getTracks()[0].stop();

  videoContainerElement.removeChild( faceOverlay );

  videoContainerElement.removeChild( faceFeedbackBox );

  return webgazer;
}

webgazer.detectCompatibility = function() {

  var getUserMedia = navigator.mediaDevices.getUserMedia ||
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  return getUserMedia !== undefined;
};

webgazer.showVideoPreview = function(val) {
  webgazer.params.showVideoPreview = val;
  webgazer.showVideo(val && webgazer.params.showVideo);
  webgazer.showFaceOverlay(val && webgazer.params.showFaceOverlay);
  webgazer.showFaceFeedbackBox(val && webgazer.params.showFaceFeedbackBox);
  return webgazer;
}

function hideVideoElement(val) {
  if (navigator.vendor && navigator.vendor.indexOf('Apple') > -1) {
    val.style.opacity = webgazer.params.showVideo ? '1': '0';
    val.style.display = 'block';
  } else {
    val.style.display = webgazer.params.showVideo ? 'block' : 'none';
  }
}

webgazer.showVideo = function(val) {
  webgazer.params.showVideo = val;
  if (videoElement) {
    hideVideoElement(videoElement);
  }
  if (videoContainerElement) {
    hideVideoElement(videoContainerElement);
  }
  return webgazer;
};

webgazer.showFaceOverlay = function(val) {
  webgazer.params.showFaceOverlay = val;
  if( faceOverlay ) {
    faceOverlay.style.display = val ? 'block' : 'none';
  }
  return webgazer;
};

webgazer.showFaceFeedbackBox = function(val) {

  webgazer.params.showFaceFeedbackBox = val;
  if( faceFeedbackBox ) {
    faceFeedbackBox.style.display = val ? 'block' : 'none';
  }
  return webgazer;
};

webgazer.showPredictionPoints = function(val) {
  webgazer.params.showGazeDot = val;
  if( gazeDot ) {
    gazeDot.style.display = val ? 'block' : 'none';
  }
  return webgazer;
};

webgazer.saveDataAcrossSessions = function(val) {
  webgazer.params.saveDataAcrossSessions = val;
  return webgazer;
}

webgazer.applyKalmanFilter = function(val) {
  webgazer.params.applyKalmanFilter = val;
  return webgazer;
}

webgazer.setCameraConstraints = async function(constraints) {
  var videoTrack,videoSettings;
  webgazer.params.camConstraints = constraints;

  if(videoStream)
  {
    webgazer.pause();
    videoTrack = videoStream.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints( webgazer.params.camConstraints );
      videoSettings = videoTrack.getSettings();
      setInternalVideoBufferSizes( videoSettings.width, videoSettings.height );
    } catch(err) {
      console.log( err );
      return;
    }

    webgazer.setVideoViewerSize( webgazer.params.videoViewerWidth, webgazer.params.videoViewerHeight )
    webgazer.getTracker().reset();
    await webgazer.resume();
  }
}

function setInternalVideoBufferSizes( width, height ) {

  if( videoElementCanvas )
  {
    videoElementCanvas.width = width;
    videoElementCanvas.height = height;
  }

  if( faceOverlay )
  {
    faceOverlay.width = width;
    faceOverlay.height = height;
  }
}

webgazer.setStaticVideo = function(videoLoc) {
  debugVideoLoc = videoLoc;
  return webgazer;
};

webgazer.setVideoViewerSize = function(w, h) {

  webgazer.params.videoViewerWidth = w;
  webgazer.params.videoViewerHeight = h;

  videoElement.style.width = w + 'px';
  videoElement.style.height = h + 'px';

  videoContainerElement.style.width = w + 'px';
  videoContainerElement.style.height = h + 'px';

  faceOverlay.style.width = w + 'px';
  faceOverlay.style.height = h + 'px';

  var tlwh = webgazer.computeValidationBoxSize()

  faceFeedbackBox.style.top = tlwh[0] + 'px';
  faceFeedbackBox.style.left = tlwh[1] + 'px';
  faceFeedbackBox.style.width = tlwh[2] + 'px';
  faceFeedbackBox.style.height = tlwh[3] + 'px';
};

webgazer.addMouseEventListeners = function() {
  addMouseEventListeners();
  return webgazer;
};

webgazer.removeMouseEventListeners = function() {
  removeMouseEventListeners();
  return webgazer;
};

webgazer.recordScreenPosition = function(x, y, eventType) {

  recordScreenPosition(x, y, eventType || eventTypes[0]);
  return webgazer;
};

webgazer.storePoints = function(x, y, k) {
  xPast50[k] = x;
  yPast50[k] = y;
}

webgazer.setTracker = function(name) {
  if (curTrackerMap[name] === undefined) {
    console.log('Invalid tracker selection');
    console.log('Options are: ');
    for (var t in curTrackerMap) {
      console.log(t);
    }
    return webgazer;
  }
  curTracker = curTrackerMap[name]();
  return webgazer;
};

webgazer.setRegression = function(name) {
  if (regressionMap[name] === undefined) {
    console.log('Invalid regression selection');
    console.log('Options are: ');
    for (var reg in regressionMap) {
      console.log(reg);
    }
    return webgazer;
  }
  data = regs[0].getData();
  regs = [regressionMap[name]()];
  regs[0].setData(data);
  return webgazer;
};

webgazer.addTrackerModule = function(name, constructor) {
  curTrackerMap[name] = function() {
    return new constructor();
  };
};

webgazer.addRegressionModule = function(name, constructor) {
  regressionMap[name] = function() {
    return new constructor();
  };
};

webgazer.addRegression = function(name) {
  var newReg = regressionMap[name]();
  data = regs[0].getData();
  newReg.setData(data);
  regs.push(newReg);
  return webgazer;
};

webgazer.setGazeListener = function(listener) {
  callback = listener;
  return webgazer;
};

webgazer.clearGazeListener = function() {
  callback = nopCallback;
  return webgazer;
};

webgazer.setVideoElementCanvas = function(canvas) {
  videoElementCanvas = canvas;
  return videoElementCanvas;
}

webgazer.clearData = async function() {
  clearData();
}

webgazer.getTracker = function() {
  return curTracker;
};

webgazer.getRegression = function() {
  return regs;
};

webgazer.getCurrentPrediction = function(regIndex) {
  return getPrediction(regIndex);
};

webgazer.params.getEventTypes = function() {
  return eventTypes.slice();
}

webgazer.getVideoElementCanvas = function() {
  return videoElementCanvas;
}

webgazer.getVideoPreviewToCameraResolutionRatio = function() {
  return [webgazer.params.videoViewerWidth / videoElement.videoWidth, webgazer.params.videoViewerHeight / videoElement.videoHeight];
}

webgazer.getStoredPoints = function() {
  return [xPast50, yPast50];
}

export default webgazer;