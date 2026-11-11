/**
 * VINYL ARCHIVE & SOUND MATRIX — APPLICATION ENTRY POINT
 * Coordinates audio synthesis, physical turntable, DOM UI and visualizer.
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.VINYL_DATA;
  if (!data) {
    return;
  }

  // 1. Initialize Audio Engine
  const audioEngine = new window.VinylAudioEngine();

  // 2. Initialize Turntable Controller
  const turntableElements = {
    powerBtn: document.getElementById("turntable-power-btn"),
    powerLed: document.getElementById("turntable-power-led"),
    rpmBtn33: document.getElementById("rpm-btn-33"),
    rpmBtn45: document.getElementById("rpm-btn-45"),
    tonearmArm: document.getElementById("tonearm-assembly"),
    cueLeverBtn: document.getElementById("cue-lever-btn"),
    muteBtn: document.getElementById("global-mute-btn"),
    platterDisc: document.getElementById("vinyl-platter-disc"),
    centerLabel: document.getElementById("vinyl-center-label"),
    statusIndicator: document.getElementById("turntable-status-text"),
    recordTitle: document.getElementById("now-playing-title"),
    recordArtist: document.getElementById("now-playing-artist"),
    recordYear: document.getElementById("now-playing-year"),
    recordGenre: document.getElementById("now-playing-genre"),
    recordTrack: document.getElementById("now-playing-track"),
    recordLabelText: document.getElementById("now-playing-label")
  };

  const turntable = new window.TurntableController(audioEngine, data);
  turntable.mount(turntableElements);

  // 3. Initialize Waveform Visualizer
  const visualizerCanvas = document.getElementById("visualizer-canvas");
  if (visualizerCanvas) {
    const visualizer = new window.AudioVisualizer(visualizerCanvas, audioEngine);
    visualizer.start();
  }

  // 4. Initialize UI Interactions & Filtering
  const uiController = new window.UiInteractionsController(data, turntable);
  uiController.init();

  // 5. First-interaction audio unblocker
  const unblockAudioOnGesture = () => {
    audioEngine.ensureAudioReady();
    window.removeEventListener("click", unblockAudioOnGesture);
    window.removeEventListener("keydown", unblockAudioOnGesture);
  };
  window.addEventListener("click", unblockAudioOnGesture, { once: true });
  window.addEventListener("keydown", unblockAudioOnGesture, { once: true });
});
