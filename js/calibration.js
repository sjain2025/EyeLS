var PointCalibrate = 0;
var CalibrationPoints = {};

var helpModal;

function drawKeyboard() {
  var canvas = document.getElementById("plotting_canvas");
  var ctx = canvas.getContext('2d');
  var text = "";

  var keys = [
    { label: "Q", x: 50, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "W", x: 185, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "E", x: 320, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "R", x: 455, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "T", x: 590, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "Y", x: 725, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "U", x: 860, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "I", x: 995, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "O", x: 1130, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "P", x: 1265, y: 250, width: 125, height: 125, color: "#ffffff" },
    { label: "A", x: 120, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "S", x: 255, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "D", x: 390, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "F", x: 525, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "G", x: 660, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "H", x: 795, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "J", x: 930, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "K", x: 1065, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "L", x: 1200, y: 385, width: 125, height: 125, color: "#ffffff" },
    { label: "Z", x: 255, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "X", x: 390, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "C", x: 525, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "V", x: 660, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "B", x: 795, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "N", x: 930, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "M", x: 1065, y: 520, width: 125, height: 125, color: "#ffffff" },
    { label: "SPACE", x: 255, y: 675, width: 940, height: 100, color: "#ffffff" },
    { label: "SPEAK", x: 1190, y: 100, width: 200, height: 75, color: "#ffffff" },
  ];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000000";

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    ctx.fillStyle = key.color;
    ctx.fillRect(key.x, key.y, key.width, key.height);
    ctx.strokeRect(key.x, key.y, key.width, key.height);
    ctx.fillStyle = "#000000";
    ctx.font = "48px Arial";
    ctx.fillText(key.label, key.x + 20, key.y + 55);
    ctx.fillStyle = "#ffffff";
  }

  var count = 0;
  var currLetter = "";
  var index = -1;
  eyels.setGazeListener(function (data, elapsedTime) {
    var xPred = data.x;
    var yPred = data.y;
    if (yPred > 250 && yPred < 375) {
      if (xPred > 50 && xPred < 175) {
        letter = "Q"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 0;
      } else if (xPred > 185 && xPred < 310) {
        letter = "W"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 1;
      } else if (xPred > 320 && xPred < 445) {
        letter = "E"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 2;
      } else if (xPred > 455 && xPred < 580) {
        letter = "R"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 3;
      } else if (xPred > 590 && xPred < 715) {
        letter = "T"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 4;
      } else if (xPred > 725 && xPred < 850) {
        letter = "Y"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 5;
      } else if (xPred > 860 && xPred < 985) {
        letter = "U"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 6;
      } else if (xPred > 995 && xPred < 1120) {
        letter = "I"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 7;
      } else if (xPred > 1130 && xPred < 1255) {
        letter = "O"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 8;
      } else if (xPred > 1265 && xPred < 1390) {
        letter = "P"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 9;
      }
    } else if (yPred > 385 && yPred < 510) {
      if (xPred > 120 && xPred < 245) {
        letter = "A"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 10;
      } else if (xPred > 255 && xPred < 380) {
        letter = "S"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 11;
      } else if (xPred > 390 && xPred < 515) {
        letter = "D"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 12;
      } else if (xPred > 525 && xPred < 650) {
        letter = "F"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 13;
      } else if (xPred > 660 && xPred < 785) {
        letter = "G"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 14;
      } else if (xPred > 795 && xPred < 920) {
        letter = "H"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 15;
      } else if (xPred > 930 && xPred < 1055) {
        letter = "J"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 16;
      } else if (xPred > 1065 && xPred < 1190) {
        letter = "K"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 17;
      } else if (xPred > 1200 && xPred < 1325) {
        letter = "L"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 18;
      }
    } else if (yPred > 520 && yPred < 645) {
      if (xPred > 255 && xPred < 380) {
        letter = "Z"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 19;
      } else if (xPred > 390 && xPred < 515) {
        letter = "X"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 20;
      } else if (xPred > 525 && xPred < 650) {
        letter = "C"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 21;
      } else if (xPred > 660 && xPred < 785) {
        letter = "V"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 22;
      } else if (xPred > 795 && xPred < 920) {
        letter = "B"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 23;
      } else if (xPred > 930 && xPred < 1055) {
        letter = "N"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 24;
      } else if (xPred > 1065 && xPred < 1190) {
        letter = "M"
        if (currLetter !== letter) {
          count = 1;
          currLetter = letter;
          if (index >= 0) {
            var key = keys[index];
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(key.x, key.y, key.width, key.height);
            ctx.strokeRect(key.x, key.y, key.width, key.height);
            ctx.fillStyle = "#000000";
            ctx.font = "48px Arial";
            ctx.fillText(key.label, key.x + 20, key.y + 55);
            ctx.fillStyle = "#ffffff";
          }
        } else {
          count++;
        }
        index = 25;
      }
    } else if (yPred > 675 && yPred < 775 && xPred > 255 && xPred < 1190) {
      letter = " "
      if (currLetter !== letter) {
        count = 1;
        currLetter = letter;
        if (index >= 0) {
          var key = keys[index];
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(key.x, key.y, key.width, key.height);
          ctx.strokeRect(key.x, key.y, key.width, key.height);
          ctx.fillStyle = "#000000";
          ctx.font = "48px Arial";
          ctx.fillText(key.label, key.x + 20, key.y + 55);
          ctx.fillStyle = "#ffffff";
        }
      } else {
        count++;
      }
      index = 26;
    } else if (xPred > 1190 && xPred < 1390 && yPred > 100 && yPred < 175) {
      letter = "+"
      if (currLetter !== letter) {
        count = 1;
        currLetter = letter;
        if (index >= 0) {
          var key = keys[index];
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(key.x, key.y, key.width, key.height);
          ctx.strokeRect(key.x, key.y, key.width, key.height);
          ctx.fillStyle = "#000000";
          ctx.font = "48px Arial";
          ctx.fillText(key.label, key.x + 20, key.y + 55);
          ctx.fillStyle = "#ffffff";
        }
      } else {
        count++;
      }
      index = 27;
    }
    var key = keys[index];
    if (count == 1) {
      ctx.fillStyle = "#cbe8ca";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    } else if (count == 3) {
      ctx.fillStyle = "#84e681";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    } else if (count == 5) {
      ctx.fillStyle = "#5dbd5b";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    } if (count == 7) {
      ctx.fillStyle = "#328a30";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    } if (count == 10) {
      ctx.fillStyle = "#237521";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    } else if (count > 12) {
      if (currLetter === "+") {
        var synth = window.speechSynthesis;
        var defaultVoice = synth.getVoices()[0];
        var toSpeak = new SpeechSynthesisUtterance(text);
        toSpeak.voice = defaultVoice;
        synth.speak(toSpeak);
      } else {
        writeLetter(currLetter);
      }
      count = 0;
      index = -1;
      currLetter = "";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(key.x, key.y, key.width, key.height);
      ctx.strokeRect(key.x, key.y, key.width, key.height);
      ctx.fillStyle = "#000000";
      ctx.font = "48px Arial";
      ctx.fillText(key.label, key.x + 20, key.y + 55);
      ctx.fillStyle = "#ffffff";
    }
  }).begin();

  function writeLetter(letter) {
    var canvas = document.getElementById("plotting_canvas");
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000000";
    ctx.font = "36px sans-serif";

    text += letter;
    var lines = [];
    var line = '';

    for (var i = 0; i < text.length; i++) {
      var testLine = line + text[i];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > 1250) {
        lines.push(line);
        line = text[i];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    var y = 60;
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], 100, y);
      y += 30;
    }
  }
}

function ClearCanvas() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('display', 'none');
  });
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  drawKeyboard();
}

function ClearCanvas1() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('display', 'none');
  });
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function PopUpInstruction() {
  ShowCalibrationPoint();
}

function helpModalShow() {
  if (!helpModal) {
    helpModal = new bootstrap.Modal(document.getElementById('helpModal'))
  }
  helpModal.show();
}

function calcAccuracy() {
  store_points_variable();
  sleep(5000).then(() => {
    stop_storing_points_variable();
    var past50 = eyels.getStoredPoints();
    var precision_measurement = calculatePrecision(past50);
    swal({
      title: "Calibration Accuracy: " + precision_measurement + "%",
    }).then(isConfirm => {
      if (isConfirm) {
        ClearCanvas();
      } else {
        eyels.clearData();
        ClearCalibration();
        ClearCanvas();
        ShowCalibrationPoint();
      }
    });
  });
}

function calPointClick(node) {
  const id = node.id;

  if (!CalibrationPoints[id]) {
    CalibrationPoints[id] = 0;
  }
  CalibrationPoints[id]++;

  if (CalibrationPoints[id] == 5) {
    node.style.setProperty('background-color', 'green');
    node.setAttribute('disabled', 'disabled');
    PointCalibrate++;
  } else if (CalibrationPoints[id] < 5) {
    var opacity = 0.2 * CalibrationPoints[id] + 0.2;
    node.style.setProperty('opacity', opacity);
  }

  if (PointCalibrate == 8) {
    document.getElementById('Pt5').style.removeProperty('display');
  }

  if (PointCalibrate >= 9) {
    document.querySelectorAll('.Calibration').forEach((i) => {
      i.style.setProperty('display', 'none');
    });
    document.getElementById('Pt5').style.removeProperty('display');

    var canvas = document.getElementById("plotting_canvas");
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    calcAccuracy();
  }
}

function docLoad() {
  // ClearCanvas();
  ClearCanvas1();
  helpModalShow();
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.addEventListener('click', () => {
      calPointClick(i);
    })
  })
};

window.addEventListener('load', docLoad);

function ShowCalibrationPoint() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.removeProperty('display');
  });
  document.getElementById('Pt5').style.setProperty('display', 'none');
}

function ClearCalibration() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('background-color', 'yellow');
    i.style.setProperty('opacity', '0.2');
    i.removeAttribute('disabled');
  });

  CalibrationPoints = {};
  PointCalibrate = 0;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
