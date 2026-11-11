/**
 * VINYL AUDIO ENGINE — Web Audio API Real-time Synthesis & Physics
 * Generates analog vinyl surface noise, needle-drop transients,
 * motor rumble, speed transposition (33/45 RPM) & procedural musical grooves.
 */

class VinylAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;

    // Noise nodes
    this.noiseNode = null;
    this.noiseGain = null;
    this.rumbleOsc = null;
    this.rumbleGain = null;

    // Music synth state
    this.isPlaying = false;
    this.currentTrackId = "thriller";
    this.currentRpm = 33;
    this.playbackRate = 1.0;
    this.musicTimer = null;
    this.stepIndex = 0;

    // Sound volumes
    this.isMuted = false;
    this.vinylCrackleLevel = 0.28;
    this.musicLevel = 0.55;

    // Callbacks for UI sync
    this.onBeat = null;
  }

  initContext() {
    if (this.audioCtx) return true;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.setupSurfaceNoiseGenerator();
      return true;
    } catch (err) {
      return false;
    }
  }

  ensureAudioReady() {
    if (!this.audioCtx) {
      this.initContext();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  setupSurfaceNoiseGenerator() {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink / brown filtered floor noise
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];

      // Random high-frequency vinyl pops & dust crackles
      if (Math.random() < 0.00075) {
        output[i] += (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6);
      }
    }

    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Bandpass filter to model needle-in-groove frequency response
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);

    this.noiseGain = this.audioCtx.createGain();
    this.noiseGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

    this.noiseNode.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start(0);

    // 50Hz Turntable Motor AC Rumble
    this.rumbleOsc = this.audioCtx.createOscillator();
    this.rumbleOsc.type = "sine";
    this.rumbleOsc.frequency.setValueAtTime(52, this.audioCtx.currentTime);

    this.rumbleGain = this.audioCtx.createGain();
    this.rumbleGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

    this.rumbleOsc.connect(this.rumbleGain);
    this.rumbleGain.connect(this.masterGain);
    this.rumbleOsc.start(0);
  }

  playNeedleDropEffect() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Heavy mechanical thump (30-60Hz)
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Surface noise swell
    this.fadeSurfaceNoise(true, 0.2);
  }

  playNeedleLiftEffect() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);

    this.fadeSurfaceNoise(false, 0.3);
  }

  fadeSurfaceNoise(enable, duration = 0.25) {
    if (!this.noiseGain || !this.rumbleGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const targetNoise = enable && !this.isMuted ? this.vinylCrackleLevel : 0.0001;
    const targetRumble = enable && !this.isMuted ? 0.045 : 0.0001;

    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.linearRampToValueAtTime(targetNoise, now + duration);

    this.rumbleGain.gain.cancelScheduledValues(now);
    this.rumbleGain.gain.linearRampToValueAtTime(targetRumble, now + duration);
  }

  setRpm(rpm) {
    this.currentRpm = rpm;
    this.playbackRate = rpm === 45 ? 1.35 : 1.0;
  }

  setTrack(trackId) {
    this.currentTrackId = trackId;
    this.stepIndex = 0;
  }

  startPlayback() {
    this.ensureAudioReady();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playNeedleDropEffect();
    this.scheduleNextNote();
  }

  stopPlayback(withBrake = false) {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (withBrake) {
      this.playVinylBrakeSound();
    } else {
      this.playNeedleLiftEffect();
    }
  }

  playVinylBrakeSound() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const brakeOsc = this.audioCtx.createOscillator();
    const brakeGain = this.audioCtx.createGain();

    brakeOsc.type = "sawtooth";
    brakeOsc.frequency.setValueAtTime(220 * this.playbackRate, now);
    brakeOsc.frequency.exponentialRampToValueAtTime(15, now + 0.65);

    brakeGain.gain.setValueAtTime(0.2, now);
    brakeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    brakeOsc.connect(brakeGain);
    brakeGain.connect(this.masterGain);
    brakeOsc.start(now);
    brakeOsc.stop(now + 0.7);

    this.fadeSurfaceNoise(false, 0.6);
  }

  // Synthesized pattern sequences for offline reliability
  getTrackPattern(trackId) {
    const patterns = {
      "thriller": {
        bpm: 116,
        rootFreq: 73.42, // D2
        bassSteps: [0, -1, 3, -1, 5, -1, 6, 5, 3, -1, 0, -1, 0, 3, 5, -1],
        leadSteps: [12, -1, 15, -1, 12, -1, 10, -1, 12, -1, 15, -1, 17, -1, 15, 12],
        isGroove: true
      },
      "dark-side": {
        bpm: 72,
        rootFreq: 82.41, // E2
        bassSteps: [0, -1, -1, -1, 0, -1, 7, -1, 0, -1, -1, -1, 5, -1, 3, -1],
        leadSteps: [12, 15, 19, 24, 19, 15, 12, 7, 10, 14, 17, 22, 17, 14, 10, 5],
        isGroove: false
      },
      "rumours": {
        bpm: 124,
        rootFreq: 87.31, // F2
        bassSteps: [0, 0, 3, 5, 7, -1, 5, 3, 0, 0, 3, 5, 7, 8, 7, 5],
        leadSteps: [12, 12, 15, 17, 19, 17, 15, 12, 12, 12, 15, 17, 19, 20, 19, 17],
        isGroove: true
      },
      "kind-of-blue": {
        bpm: 85,
        rootFreq: 73.42, // D2
        bassSteps: [0, -1, 5, -1, 7, -1, 10, 12, 0, -1, 5, -1, 7, 10, 7, 5],
        leadSteps: [12, 15, 19, 22, -1, -1, 24, 22, 19, 15, 12, 10, 7, 5, 3, 0],
        isGroove: false
      }
    };
    return patterns[trackId] || patterns["thriller"];
  }

  scheduleNextNote() {
    if (!this.isPlaying || !this.audioCtx) return;

    const pattern = this.getTrackPattern(this.currentTrackId);
    const intervalMs = (60000 / (pattern.bpm * 4)) / this.playbackRate;

    const bassSemitone = pattern.bassSteps[this.stepIndex % pattern.bassSteps.length];
    const leadSemitone = pattern.leadSteps[this.stepIndex % pattern.leadSteps.length];

    if (bassSemitone >= 0) {
      this.playSynthNote(pattern.rootFreq, bassSemitone, "triangle", 0.28, 0.16);
    }

    if (leadSemitone >= 0 && (this.stepIndex % 2 === 0)) {
      this.playSynthNote(pattern.rootFreq * 2, leadSemitone, "sine", 0.15, 0.25);
    }

    if (pattern.isGroove && (this.stepIndex % 4 === 2)) {
      this.playSnareTransient();
    }

    if (typeof this.onBeat === "function") {
      this.onBeat(this.stepIndex, pattern);
    }

    this.stepIndex++;
    this.musicTimer = setTimeout(() => this.scheduleNextNote(), intervalMs);
  }

  playSynthNote(rootFreq, semitone, waveType, gainAmount, duration) {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    const freq = rootFreq * Math.pow(2, semitone / 12) * this.playbackRate;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, now);

    // Warm analog low-pass filter
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800 * this.playbackRate, now);

    const actualGain = gainAmount * this.musicLevel;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(actualGain, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playSnareTransient() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

    gain.gain.setValueAtTime(0.08 * this.musicLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0001 : 1.0, now + 0.1);
    }
    return this.isMuted;
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(64);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

if (typeof window !== "undefined") {
  window.VinylAudioEngine = VinylAudioEngine;
}
