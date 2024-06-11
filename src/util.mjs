import mat from './mat.mjs';
import params from './params.mjs';

const util = {};

var resizeWidth = 10;
var resizeHeight = 6;

util.Eye = function (patch, imagex, imagey, width, height) {
    this.patch = patch;
    this.imagex = imagex;
    this.imagey = imagey;
    this.width = width;
    this.height = height;
};

util.getEyeFeats = function (eyes) {
    let process = (eye) => {
        let resized = this.resizeEye(eye, resizeWidth, resizeHeight);
        let gray = this.grayscale(resized.data, resized.width, resized.height);
        let hist = [];
        this.equalizeHistogram(gray, 5, hist);
        return hist;
    };

    if (eyels.params.trackEye == 'left') {
        return process(eyes.left);
    }
    else if (eyels.params.trackEye == 'right') {
        return process(eyes.right);
    }
    else {
        return [].concat(process(eyes.left), process(eyes.right));
    }
}

util.DataWindow = function (windowSize, data) {
    this.data = [];
    this.windowSize = windowSize;
    this.index = 0;
    this.length = 0;
    if (data) {
        this.data = data.slice(data.length - windowSize, data.length);
        this.length = this.data.length;
    }
};

util.DataWindow.prototype.push = function (entry) {
    if (this.data.length < this.windowSize) {
        this.data.push(entry);
        this.length = this.data.length;
        return this;
    }

    this.data[this.index] = entry;
    this.index = (this.index + 1) % this.windowSize;
    return this;
};

util.DataWindow.prototype.get = function (ind) {
    return this.data[this.getTrueIndex(ind)];
};

util.DataWindow.prototype.getTrueIndex = function (ind) {
    if (this.data.length < this.windowSize) {
        return ind;
    } else {

        return (ind + this.index) % this.windowSize;
    }
};

util.DataWindow.prototype.addAll = function (data) {
    for (var i = 0; i < data.length; i++) {
        this.push(data[i]);
    }
};

util.grayscale = function (pixels, width, height) {
    var gray = new Uint8ClampedArray(pixels.length >> 2);
    var p = 0;
    var w = 0;
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var value = pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114;
            gray[p++] = value;

            w += 4;
        }
    }
    return gray;
};

util.equalizeHistogram = function (src, step, dst) {
    var srcLength = src.length;
    if (!dst) dst = src;
    if (!step) step = 5;

    var hist = Array(256).fill(0);

    for (var i = 0; i < srcLength; i += step) {
        ++hist[src[i]];
    }

    var norm = 255 * step / srcLength,
        prev = 0;
    for (var i = 0; i < 256; ++i) {
        var h = hist[i];
        prev = h += prev;
        hist[i] = h * norm;
    }

    for (var i = 0; i < srcLength; ++i) {
        dst[i] = hist[src[i]];
    }
    return dst;
};

util.threshold = function (data, threshold) {
    for (let i = 0; i < data.length; i++) {
        data[i] = (data[i] > threshold) ? 255 : 0;
    }
    return data;
};

util.correlation = function (data1, data2) {
    const length = Math.min(data1.length, data2.length);
    let count = 0;
    for (let i = 0; i < length; i++) {
        if (data1[i] === data2[i]) {
            count++;
        }
    }
    return count / Math.max(data1.length, data2.length);
};

util.resizeEye = function (eye, resizeWidth, resizeHeight) {

    var canvas = document.createElement('canvas');
    canvas.width = eye.width;
    canvas.height = eye.height;

    canvas.getContext('2d').putImageData(eye.patch, 0, 0);

    var tempCanvas = document.createElement('canvas');

    tempCanvas.width = resizeWidth;
    tempCanvas.height = resizeHeight;

    tempCanvas.getContext('2d').drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizeWidth, resizeHeight);

    return tempCanvas.getContext('2d').getImageData(0, 0, resizeWidth, resizeHeight);
};

util.bound = function (prediction) {
    if (prediction.x < 0)
        prediction.x = 0;
    if (prediction.y < 0)
        prediction.y = 0;
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (prediction.x > w) {
        prediction.x = w;
    }

    if (prediction.y > h) {
        prediction.y = h;
    }
    return prediction;
};

function debugBoxWrite(para, stats) {
    var str = '';
    for (var key in stats) {
        str += key + ': ' + stats[key] + '\n';
    }
    para.innerText = str;
}

util.DebugBox = function (interval) {
    this.para = document.createElement('p');
    this.div = document.createElement('div');
    this.div.appendChild(this.para);
    document.body.appendChild(this.div);

    this.buttons = {};
    this.canvas = {};
    this.stats = {};
    var updateInterval = interval || 300;
    (function (localThis) {
        setInterval(function () {
            debugBoxWrite(localThis.para, localThis.stats);
        }, updateInterval);
    }(this));
};

util.DebugBox.prototype.set = function (key, value) {
    this.stats[key] = value;
};

util.DebugBox.prototype.inc = function (key, incBy, init) {
    if (!this.stats[key]) {
        this.stats[key] = init || 0;
    }
    this.stats[key] += incBy || 1;
};

util.DebugBox.prototype.addButton = function (name, func) {
    if (!this.buttons[name]) {
        this.buttons[name] = document.createElement('button');
        this.div.appendChild(this.buttons[name]);
    }
    var button = this.buttons[name];
    this.buttons[name] = button;
    button.addEventListener('click', func);
    button.innerText = name;
};

util.DebugBox.prototype.show = function (name, func) {
    if (!this.canvas[name]) {
        this.canvas[name] = document.createElement('canvas');
        this.div.appendChild(this.canvas[name]);
    }
    var canvas = this.canvas[name];
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    func(canvas);
};

export default util;