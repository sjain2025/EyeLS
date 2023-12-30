import util from './util.mjs';
import util_regression from './util_regression.mjs';
import params from './params.mjs';

const reg = {};

reg.RidgeReg = function() {
  this.init();
};

reg.RidgeReg.prototype.init = util_regression.InitRegression

reg.RidgeReg.prototype.addData = util_regression.addData

reg.RidgeReg.prototype.predict = function(eyesObj) {
  if (!eyesObj || this.eyeFeaturesClicks.length === 0) {
    return null;
  }
  var acceptTime = performance.now() - this.trailTime;
  var trailX = [];
  var trailY = [];
  var trailFeat = [];
  for (var i = 0; i < this.trailDataWindow; i++) {
    if (this.trailTimes.get(i) > acceptTime) {
      trailX.push(this.screenXTrailArray.get(i));
      trailY.push(this.screenYTrailArray.get(i));
      trailFeat.push(this.eyeFeaturesTrail.get(i));
    }
  }

  var screenXArray = this.screenXClicksArray.data.concat(trailX);
  var screenYArray = this.screenYClicksArray.data.concat(trailY);
  var eyeFeatures = this.eyeFeaturesClicks.data.concat(trailFeat);

  var coefficientsX = util_regression.ridge(screenXArray, eyeFeatures, this.ridgeParameter);
  var coefficientsY = util_regression.ridge(screenYArray, eyeFeatures, this.ridgeParameter);

  var eyeFeats = util.getEyeFeats(eyesObj);
  var predictedX = 0;
  for(var i=0; i< eyeFeats.length; i++){
    predictedX += eyeFeats[i] * coefficientsX[i];
  }
  var predictedY = 0;
  for(var i=0; i< eyeFeats.length; i++){
    predictedY += eyeFeats[i] * coefficientsY[i];
  }

  predictedX = Math.floor(predictedX);
  predictedY = Math.floor(predictedY);

  if (params.applyKalmanFilter) {

    var newGaze = [predictedX, predictedY]; 
    newGaze = this.kalman.update(newGaze);

    return {
      x: newGaze[0],
      y: newGaze[1]
    };
  } else {
    return {
      x: predictedX,
      y: predictedY
    };
  }
};

reg.RidgeReg.prototype.setData = util_regression.setData;

reg.RidgeReg.prototype.getData = function() {
  return this.dataClicks.data;
}

reg.RidgeReg.prototype.name = 'ridge';

export default reg;