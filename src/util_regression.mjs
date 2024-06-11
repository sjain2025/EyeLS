import util from './util.mjs';
import mat from './mat.mjs';
import params from './params.mjs';

const util_regression = {};

util_regression.InitRegression = function () {
  var dataWindow = 700;
  var trailDataWindow = 10;
  this.ridgeParameter = Math.pow(10, -5);
  this.errorXArray = new util.DataWindow(dataWindow);
  this.errorYArray = new util.DataWindow(dataWindow);

  this.screenXClicksArray = new util.DataWindow(dataWindow);
  this.screenYClicksArray = new util.DataWindow(dataWindow);
  this.eyeFeaturesClicks = new util.DataWindow(dataWindow);

  this.trailTime = 1000;
  this.trailDataWindow = this.trailTime / params.moveTickSize;
  this.screenXTrailArray = new util.DataWindow(trailDataWindow);
  this.screenYTrailArray = new util.DataWindow(trailDataWindow);
  this.eyeFeaturesTrail = new util.DataWindow(trailDataWindow);
  this.trailTimes = new util.DataWindow(trailDataWindow);

  this.dataClicks = new util.DataWindow(dataWindow);
  this.dataTrail = new util.DataWindow(trailDataWindow);

  var F = [[1, 0, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 1]];

  var Q = [[1 / 4, 0, 1 / 2, 0],
  [0, 1 / 4, 0, 1 / 2],
  [1 / 2, 0, 1, 0],
  [0, 1 / 2, 0, 1]];
  var delta_t = 1 / 10;
  Q = mat.multScalar(Q, delta_t);

  var H = [[1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0]];
  var H = [[1, 0, 0, 0],
  [0, 1, 0, 0]];
  var pixel_error = 47;

  var R = mat.multScalar(mat.identity(2), pixel_error);

  var P_initial = mat.multScalar(mat.identity(4), 0.0001);
  var x_initial = [[500], [500], [0], [0]];

  this.kalman = new util_regression.KalmanFilter(F, H, Q, R, P_initial, x_initial);
}

util_regression.KalmanFilter = function (F, H, Q, R, P_initial, X_initial) {
  this.F = F;
  this.Q = Q;
  this.H = H;
  this.R = R;
  this.P = P_initial;
  this.X = X_initial;
};

util_regression.KalmanFilter.prototype.update = function (z) {

  var {
    add, sub, mult, inv, identity, transpose,
  } = mat;

  var X_p = mult(this.F, this.X);
  var P_p = add(mult(mult(this.F, this.P), transpose(this.F)), this.Q);

  z = transpose([z])
  var y = sub(z, mult(this.H, X_p));
  var S = add(mult(mult(this.H, P_p), transpose(this.H)), this.R);

  var K = mult(P_p, mult(transpose(this.H), inv(S)));

  for (var i = 0; i < y.length; i++) {
    y[i] = [y[i]];
  }

  this.X = add(X_p, mult(K, y));
  this.P = mult(sub(identity(K.length), mult(K, this.H)), P_p);
  return transpose(mult(this.H, this.X))[0];
};

util_regression.ridge = function (y, X, k) {
  var nc = X[0].length;
  var m_Coefficients = new Array(nc);
  var xt = mat.transpose(X);
  var solution = new Array();
  var success = true;
  do {
    var ss = mat.mult(xt, X);

    for (var i = 0; i < nc; i++) {
      ss[i][i] = ss[i][i] + k;
    }

    var bb = mat.mult(xt, y);
    for (var i = 0; i < nc; i++) {
      m_Coefficients[i] = bb[i][0];
    }
    try {
      var n = (m_Coefficients.length !== 0 ? m_Coefficients.length / m_Coefficients.length : 0);
      if (m_Coefficients.length * n !== m_Coefficients.length) {
        console.log('Array length must be a multiple of m')
      }
      solution = mat.solve(ss, bb);

      for (var i = 0; i < nc; i++) {
        m_Coefficients[i] = solution[i];
      }
      success = true;
    }
    catch (ex) {
      k *= 10;
      console.log(ex);
      success = false;
    }
  } while (!success);
  return m_Coefficients;
}

util_regression.setData = function (data) {
  for (var i = 0; i < data.length; i++) {

    var leftData = new Uint8ClampedArray(data[i].eyes.left.patch.data);
    var rightData = new Uint8ClampedArray(data[i].eyes.right.patch.data);

    data[i].eyes.left.patch = new ImageData(leftData, data[i].eyes.left.width, data[i].eyes.left.height);
    data[i].eyes.right.patch = new ImageData(rightData, data[i].eyes.right.width, data[i].eyes.right.height);

    this.addData(data[i].eyes, data[i].screenPos, data[i].type);
  }
};

util_regression.getCurrentFixationIndex = function () {
  var index = 0;
  var recentX = this.screenXTrailArray.get(0);
  var recentY = this.screenYTrailArray.get(0);
  for (var i = this.screenXTrailArray.length - 1; i >= 0; i--) {
    var currX = this.screenXTrailArray.get(i);
    var currY = this.screenYTrailArray.get(i);
    var euclideanDistance = Math.sqrt(Math.pow((currX - recentX), 2) + Math.pow((currY - recentY), 2));
    if (euclideanDistance > 72) {
      return i + 1;
    }
  }
  return i;
}

util_regression.addData = function (eyes, screenPos, type) {
  if (!eyes) {
    return;
  }

  if (type === 'click') {
    this.screenXClicksArray.push([screenPos[0]]);
    this.screenYClicksArray.push([screenPos[1]]);
    this.eyeFeaturesClicks.push(util.getEyeFeats(eyes));
    this.dataClicks.push({ 'eyes': eyes, 'screenPos': screenPos, 'type': type });
  } else if (type === 'move') {
    this.screenXTrailArray.push([screenPos[0]]);
    this.screenYTrailArray.push([screenPos[1]]);

    this.eyeFeaturesTrail.push(util.getEyeFeats(eyes));
    this.trailTimes.push(performance.now());
    this.dataTrail.push({ 'eyes': eyes, 'screenPos': screenPos, 'type': type });
  }

};

export default util_regression;