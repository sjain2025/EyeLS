import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const TFFaceMesh = function () {

  this.model = faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
  this.predictionReady = false;
};

TFFaceMesh.prototype.positionsArray = null;

TFFaceMesh.prototype.getEyePatches = async function (video, imageCanvas, width, height) {

  if (imageCanvas.width === 0) {
    return null;
  }

  const model = await this.model;

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: false,
  });

  if (predictions.length == 0) {
    return false;
  }

  this.positionsArray = predictions[0].scaledMesh;
  const prediction = predictions[0]
  const positions = this.positionsArray;

  const { scaledMesh } = predictions[0];

  const [leftBBox, rightBBox] = [

    {
      eyeTopArc: prediction.annotations.leftEyeUpper0,
      eyeBottomArc: prediction.annotations.leftEyeLower0
    },

    {
      eyeTopArc: prediction.annotations.rightEyeUpper0,
      eyeBottomArc: prediction.annotations.rightEyeLower0
    },
  ].map(({ eyeTopArc, eyeBottomArc }) => {
    const topLeftOrigin = {
      x: Math.round(Math.min(...eyeTopArc.map(v => v[0]))),
      y: Math.round(Math.min(...eyeTopArc.map(v => v[1]))),
    };
    const bottomRightOrigin = {
      x: Math.round(Math.max(...eyeBottomArc.map(v => v[0]))),
      y: Math.round(Math.max(...eyeBottomArc.map(v => v[1]))),
    };

    return {
      origin: topLeftOrigin,
      width: bottomRightOrigin.x - topLeftOrigin.x,
      height: bottomRightOrigin.y - topLeftOrigin.y,
    }
  });
  var leftOriginX = leftBBox.origin.x;
  var leftOriginY = leftBBox.origin.y;
  var leftWidth = leftBBox.width;
  var leftHeight = leftBBox.height;
  var rightOriginX = rightBBox.origin.x;
  var rightOriginY = rightBBox.origin.y;
  var rightWidth = rightBBox.width;
  var rightHeight = rightBBox.height;

  if (leftWidth === 0 || rightWidth === 0) {
    console.log('an eye patch had zero width');
    return null;
  }

  if (leftHeight === 0 || rightHeight === 0) {
    console.log('an eye patch had zero height');
    return null;
  }

  var eyeObjs = {};

  var leftImageData = imageCanvas.getContext('2d').getImageData(leftOriginX, leftOriginY, leftWidth, leftHeight);
  eyeObjs.left = {
    patch: leftImageData,
    imagex: leftOriginX,
    imagey: leftOriginY,
    width: leftWidth,
    height: leftHeight
  };

  var rightImageData = imageCanvas.getContext('2d').getImageData(rightOriginX, rightOriginY, rightWidth, rightHeight);
  eyeObjs.right = {
    patch: rightImageData,
    imagex: rightOriginX,
    imagey: rightOriginY,
    width: rightWidth,
    height: rightHeight
  };

  this.predictionReady = true;

  return eyeObjs;
};

TFFaceMesh.prototype.getPositions = function () {
  return this.positionsArray;
}

TFFaceMesh.prototype.reset = function () {
  console.log("Unimplemented; Tracking.js has no obvious reset function");
}

TFFaceMesh.prototype.drawFaceOverlay = function (ctx, keypoints) {

  if (keypoints) {
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < keypoints.length; i++) {
      const x = keypoints[i][0];
      const y = keypoints[i][1];

      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
}

TFFaceMesh.prototype.name = 'TFFaceMesh';

export default TFFaceMesh;