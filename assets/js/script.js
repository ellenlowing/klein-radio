$(document).ready(function () {
  $("#jquery_jplayer_1").jPlayer({
    ready: function (event) {
      $(this).jPlayer("setMedia", {
        oga: "https://moshimoshi.out.airtime.pro:8000/moshimoshi_a",
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
  audio.crossOrigin = "anonymous";
  let distortionFx, pitchShiftFx;

  let distortionSlider = document.getElementById("distortion");
  distortionSlider.oninput = () => {
    if (distortionFx) distortionFx.distortion = distortionSlider.value;
  };
  let pitchShiftSlider = document.getElementById("pitchshift");
  pitchShiftSlider.oninput = () => {
    if (pitchShiftFx) pitchShiftFx.pitch = pitchShiftSlider.value;
  };

  audio.addEventListener("play", () => {
    context = new AudioContext();
    Tone.setContext(context);
    let source = context.createMediaElementSource(audio);
    let gainNode = context.createGain();
    source.connect(gainNode);
    gainNode.connect(context.destination);

    distortionFx = new Tone.Distortion(2);
    pitchShiftFx = new Tone.PitchShift(10);

    // Use the Tone.connect() helper to connect native AudioNodes with the nodes provided by Tone.js
    Tone.connect(gainNode, distortionFx);
    Tone.connect(distortionFx, pitchShiftFx);
    Tone.connect(pitchShiftFx, context.destination);
  });
});
