import util from './util.mjs';
import util_regression from './util_regression.mjs';
import params from './params.mjs';
import mat from './mat.mjs';

const reg = {};

var ridgeParameter = Math.pow(10,-5);
var dataWindow = 700;
var weights = {'X':[0],'Y':[0]};
var trailDataWindow = 10;

reg.RidgeRegThreaded = function() {
    this.init();
};

reg.RidgeRegThreaded.prototype.init = function() { 
    this.screenXClicksArray = new util.DataWindow(dataWindow);  
    this.screenYClicksArray = new util.DataWindow(dataWindow);  
    this.eyeFeaturesClicks = new util.DataWindow(dataWindow);   

    this.screenXTrailArray = new util.DataWindow(trailDataWindow);  
    this.screenYTrailArray = new util.DataWindow(trailDataWindow);  
    this.eyeFeaturesTrail = new util.DataWindow(trailDataWindow);   

    this.dataClicks = new util.DataWindow(dataWindow);  
    this.dataTrail = new util.DataWindow(dataWindow);   

    if (!this.worker) { 
        this.worker = new Worker('ridgeWorker.mjs'); 
        this.worker.onerror = function(err) { console.log(err.message); };  
        this.worker.onmessage = function(evt) { 
            weights.X = evt.data.X; 
            weights.Y = evt.data.Y; 
        };  
        console.log('initialized worker');  
    }   

    var F = [ [1, 0, 1, 0], 
              [0, 1, 0, 1], 
              [0, 0, 1, 0], 
              [0, 0, 0, 1]];    

    var Q = [ [1/4, 0,    1/2, 0],  
              [0,   1/4,  0,   1/2],    
              [1/2, 0,    1,   0],  
              [0,  1/2,  0,   1]];
    var delta_t = 1/10; 
    Q = mat.multScalar(Q, delta_t);    

    var H = [ [1, 0, 0, 0, 0, 0],   
              [0, 1, 0, 0, 0, 0],   
              [0, 0, 1, 0, 0, 0],   
              [0, 0, 0, 1, 0, 0]];  
    var H = [ [1, 0, 0, 0], 
              [0, 1, 0, 0]];    
    var pixel_error = 47; 

    var R = mat.multScalar(mat.identity(2), pixel_error);  

    var P_initial = mat.multScalar(mat.identity(4), 0.0001); 
    var x_initial = [[500], [500], [0], [0]]; 

    this.kalman = new util_regression.KalmanFilter(F, H, Q, R, P_initial, x_initial);  
}

reg.RidgeRegThreaded.prototype.addData = function(eyes, screenPos, type) {
    if (!eyes) {
        return;
    }

    this.worker.postMessage({'eyes':util.getEyeFeats(eyes), 'screenPos':screenPos, 'type':type});
};

reg.RidgeRegThreaded.prototype.predict = function(eyesObj) {

    if (!eyesObj) {
        return null;
    }
    var coefficientsX = weights.X;
    var coefficientsY = weights.Y;

    var eyeFeats = util.getEyeFeats(eyesObj);
    var predictedX = 0, predictedY = 0;
    for(var i=0; i< eyeFeats.length; i++){
        predictedX += eyeFeats[i] * coefficientsX[i];
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

reg.RidgeRegThreaded.prototype.setData = util_regression.setData

reg.RidgeRegThreaded.prototype.getData = function() {
    return this.dataClicks.data;
};

reg.RidgeRegThreaded.prototype.name = 'ridge';

export default reg;