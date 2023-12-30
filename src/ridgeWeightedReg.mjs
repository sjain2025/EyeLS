import util from './util.mjs';
import util_regression from './util_regression.mjs';
import params from './params.mjs';

const reg = {};

reg.RidgeWeightedReg = function() {
    this.init();
};

reg.RidgeWeightedReg.prototype.init = util_regression.InitRegression

reg.RidgeWeightedReg.prototype.addData = util_regression.addData

reg.RidgeWeightedReg.prototype.predict = function(eyesObj) {
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

    var len = this.eyeFeaturesClicks.data.length;
    var weightedEyeFeats = Array(len);
    var weightedXArray = Array(len);
    var weightedYArray = Array(len);
    for (var i = 0; i < len; i++) {
        var weight = Math.sqrt( 1 / (len - i) ); 

        var trueIndex = this.eyeFeaturesClicks.getTrueIndex(i);
        for (var j = 0; j < this.eyeFeaturesClicks.data[trueIndex].length; j++) {
            var val = this.eyeFeaturesClicks.data[trueIndex][j] * weight;
            if (weightedEyeFeats[trueIndex] !== undefined){
                weightedEyeFeats[trueIndex].push(val);
            } else {
                weightedEyeFeats[trueIndex] = [val];
            }
        }
        weightedXArray[i] = this.screenXClicksArray.get(i).slice(0, this.screenXClicksArray.get(i).length);
        weightedYArray[i] = this.screenYClicksArray.get(i).slice(0, this.screenYClicksArray.get(i).length);
        weightedXArray[i][0] = weightedXArray[i][0] * weight;
        weightedYArray[i][0] = weightedYArray[i][0] * weight;
    }

    var screenXArray = weightedXArray.concat(trailX);
    var screenYArray = weightedYArray.concat(trailY);
    var eyeFeatures = weightedEyeFeats.concat(trailFeat);

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

reg.RidgeWeightedReg.prototype.setData = util_regression.setData;

reg.RidgeWeightedReg.prototype.getData = function() {
    return this.dataClicks.data;
};

reg.RidgeWeightedReg.prototype.name = 'ridgeWeighted';

export default reg;