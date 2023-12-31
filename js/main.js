window.onload = async function () {
    await eyels.setRegression('ridge')
        .setGazeListener(function (data, clock) { })
        .saveDataAcrossSessions(true)
        .begin();
    eyels.showVideoPreview(false)
        .showPredictionPoints(true)
        .applyKalmanFilter(true);
    var setup = function () {
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();
};

window.saveDataAcrossSessions = true;
window.onbeforeunload = function () {
    eyels.end();
}

function Restart() {
    eyels.clearData();
    ClearCalibration();
    PopUpInstruction();
}