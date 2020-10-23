let distortionInput = 0;
let pitchShiftInput = 0;

let distortionFx, pitchShiftFx;

let analyser = null;

$(document).ready(function () {
  $("#jquery_jplayer_1").jPlayer({
    ready: function (event) {
      $(this).jPlayer("setMedia", {
        oga: "http://sourcefabric.out.airtime.pro:8000/sourcefabric_a",
      });
    },
    swfPath: "js",
    supplied: "oga",
    wmode: "window",
    smoothPlayBar: true,
    keyEnabled: true,
  });

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audio = document.querySelector("audio");
  let context;
  let source = null;
  let gainNode = null;
  audio.crossOrigin = "anonymous";

  audio.addEventListener("play", () => {
    context = new AudioContext();
    analyser = context.createAnalyser();
    Tone.setContext(context);
    source = context.createMediaElementSource(audio);

    gainNode = context.createGain();
    source.connect(analyser);
    analyser.connect(gainNode);
    // gainNode.connect(context.destination);
    distortionFx = new Tone.Distortion(distortionInput);
    pitchShiftFx = new Tone.PitchShift(pitchShiftInput);

    // Use the Tone.connect() helper to connect native AudioNodes with the nodes provided by Tone.js
    Tone.connect(gainNode, distortionFx);
    Tone.connect(distortionFx, pitchShiftFx);
    Tone.connect(pitchShiftFx, context.destination);
  });
});

let lineX;
let lineY;
let vizWidth;
let vizHeight;
let dragStarted = false;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);
  fill(255);
  stroke(255);
  lineX = windowWidth / 2;
  lineY = windowHeight / 2;
  vizWidth = lineX;
  vizHeight = lineY;
  gridResized(windowWidth / 2, windowHeight / 2);
}

function draw() {
  background(0);
  line(lineX, 0, lineX, windowHeight);
  line(0, lineY, windowWidth, lineY);
  if (distortionFx) distortionFx.distortion = map(mouseX, 0, windowWidth, 0, 5);
  if (pitchShiftFx) pitchShiftFx.pitch = map(mouseY, 0, windowHeight, 0, 10);

  if (analyser) {
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    noFill();
    beginShape();
    let sliceWidth = (vizWidth * 1.0) / bufferLength;
    let x = lineX;
    for (let i = 0; i < bufferLength; i++) {
      stroke(i);
      let v = dataArray[i] / 128.0;
      let y = (v * vizHeight) / 2 + lineY;
      curveVertex(x, y);
      x += sliceWidth;
    }
    endShape();
  }
}

function mouseDragged() {
  if (!dragStarted && dist(mouseX, mouseY, lineX, lineY) < 20)
    dragStarted = true;
  if (dragStarted) {
    gridResized(mouseX, mouseY);
  }
}

function mouseReleased() {
  dragStarted = false;
}

function gridResized(x, y) {
  lineX = x;
  lineY = y;
  vizWidth = windowWidth - lineX;
  vizHeight = windowHeight - lineY;
  $(".chatango").css({
    width: `${lineX * 0.8}px`,
    height: `${lineY * 0.8}px`,
    top: `${lineY * 0.1}px`,
    left: `${lineX * 0.1}px`,
  });
}
