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

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);
  fill(255);
  stroke(255);
}

function draw() {
  background(0);
  line(mouseX, 0, mouseX, windowHeight);
  line(0, mouseY, windowWidth, mouseY);
  if (distortionFx) distortionFx.distortion = map(mouseX, 0, windowWidth, 0, 5);
  if (pitchShiftFx) pitchShiftFx.pitch = map(mouseY, 0, windowHeight, 0, 10);

  if (analyser) {
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    noFill();
    beginShape();
    let sliceWidth = (windowWidth * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      stroke(i);
      let v = dataArray[i] / 128.0;
      let y = (v * windowHeight) / 2;
      curveVertex(x, y);
      x += sliceWidth;
    }
    endShape();
  }
}
