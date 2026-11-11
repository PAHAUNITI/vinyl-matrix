/**
 * VINYL TURNTABLE UI CONTROLLER
 * Controls physical turntable animations, tonearm mechanics,
 * RPM switches, platter drag/scratch physics, and album swapping.
 */

class TurntableController {
  constructor(audioEngine, vinylData) {
    this.audio = audioEngine;
    this.data = vinylData;

    // Turntable State
    this.isMotorOn = false;
    this.isNeedleDown = false;
    this.currentRpm = 33;
    this.currentRecordIndex = 0;
    this.rotationAngle = 0;
    this.rotationVelocity = 0;
    this.targetVelocity = 0;
    this.animFrameId = null;
    this.isDragging = false;
    this.dragStartAngle = 0;
    this.dragStartRotation = 0;

    // DOM Elements
    this.dom = {};
  }

  mount(elements) {
    this.dom = elements;
    this.bindEvents();
    this.loadRecord(this.data.records[0]);
    this.startAnimationLoop();
  }

  bindEvents() {
    if (this.dom.powerBtn) {
      this.dom.powerBtn.addEventListener("click", () => this.toggleMotor());
    }

    if (this.dom.rpmBtn33) {
      this.dom.rpmBtn33.addEventListener("click", () => this.setRpm(33));
    }

    if (this.dom.rpmBtn45) {
      this.dom.rpmBtn45.addEventListener("click", () => this.setRpm(45));
    }

    if (this.dom.tonearmArm) {
      this.dom.tonearmArm.addEventListener("click", () => this.toggleTonearm());
    }

    if (this.dom.cueLeverBtn) {
      this.dom.cueLeverBtn.addEventListener("click", () => this.toggleTonearm());
    }

    if (this.dom.muteBtn) {
      this.dom.muteBtn.addEventListener("click", () => this.toggleMute());
    }

    // Scratching / Dragging physics on platter
    if (this.dom.platterDisc) {
      this.dom.platterDisc.addEventListener("mousedown", (e) => this.onDragStart(e));
      window.addEventListener("mousemove", (e) => this.onDragMove(e));
      window.addEventListener("mouseup", () => this.onDragEnd());

      // Touch events for mobile
      this.dom.platterDisc.addEventListener("touchstart", (e) => this.onDragStart(e.touches[0]));
      window.addEventListener("touchmove", (e) => this.onDragMove(e.touches[0]));
      window.addEventListener("touchend", () => this.onDragEnd());
    }
  }

  toggleMotor() {
    this.isMotorOn = !this.isMotorOn;
    this.audio.ensureAudioReady();

    if (this.isMotorOn) {
      this.targetVelocity = (this.currentRpm * 360) / (60 * 60); // degrees per frame (60fps)
      if (this.dom.powerLed) this.dom.powerLed.classList.add("active");
      if (this.dom.powerBtn) this.dom.powerBtn.classList.add("btn-pressed");

      if (this.isNeedleDown) {
        this.audio.startPlayback();
      }
    } else {
      this.targetVelocity = 0;
      if (this.dom.powerLed) this.dom.powerLed.classList.remove("active");
      if (this.dom.powerBtn) this.dom.powerBtn.classList.remove("btn-pressed");
      this.audio.stopPlayback(true);
    }
    this.updateStatusDisplay();
  }

  setRpm(rpm) {
    this.currentRpm = rpm;
    this.audio.setRpm(rpm);

    if (this.dom.rpmBtn33) {
      this.dom.rpmBtn33.classList.toggle("active", rpm === 33);
    }
    if (this.dom.rpmBtn45) {
      this.dom.rpmBtn45.classList.toggle("active", rpm === 45);
    }

    if (this.isMotorOn) {
      this.targetVelocity = (this.currentRpm * 360) / (60 * 60);
    }
    this.updateStatusDisplay();
  }

  toggleTonearm() {
    this.isNeedleDown = !this.isNeedleDown;
    this.audio.ensureAudioReady();

    if (this.dom.tonearmArm) {
      this.dom.tonearmArm.classList.toggle("needle-on-record", this.isNeedleDown);
    }
    if (this.dom.cueLeverBtn) {
      this.dom.cueLeverBtn.classList.toggle("active", this.isNeedleDown);
      this.dom.cueLeverBtn.textContent = this.isNeedleDown ? "CUE LIFT [▲]" : "CUE DROP [▼]";
    }

    if (this.isNeedleDown && this.isMotorOn) {
      this.audio.startPlayback();
    } else {
      this.audio.stopPlayback(false);
    }
    this.updateStatusDisplay();
  }

  toggleMute() {
    const isMuted = this.audio.toggleMute();
    if (this.dom.muteBtn) {
      this.dom.muteBtn.classList.toggle("muted", isMuted);
      this.dom.muteBtn.textContent = isMuted ? "UNMUTE SOUND 🔊" : "MUTE AUDIO 🔇";
    }
  }

  loadRecord(record) {
    if (!record) return;
    this.currentRecord = record;
    this.audio.setTrack(record.id);

    if (this.dom.recordTitle) this.dom.recordTitle.textContent = record.title;
    if (this.dom.recordArtist) this.dom.recordArtist.textContent = record.artist;
    if (this.dom.recordYear) this.dom.recordYear.textContent = record.year;
    if (this.dom.recordGenre) this.dom.recordGenre.textContent = record.genre;
    if (this.dom.recordTrack) this.dom.recordTrack.textContent = record.trackTitle;
    if (this.dom.recordLabelText) this.dom.recordLabelText.textContent = record.label;

    if (this.dom.platterDisc) {
      this.dom.platterDisc.style.setProperty("--vinyl-tint", record.vinylHex);
      this.dom.platterDisc.setAttribute("data-record-id", record.id);
    }

    if (this.dom.centerLabel) {
      this.dom.centerLabel.style.backgroundColor = record.labelBg || "#111";
    }

    if (this.isMotorOn && this.isNeedleDown) {
      this.audio.startPlayback();
    }
    this.updateStatusDisplay();
  }

  onDragStart(e) {
    if (!this.dom.platterDisc) return;
    this.isDragging = true;
    const rect = this.dom.platterDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.dragStartAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    this.dragStartRotation = this.rotationAngle;
    this.dom.platterDisc.classList.add("scratching");
  }

  onDragMove(e) {
    if (!this.isDragging || !this.dom.platterDisc) return;
    const rect = this.dom.platterDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const delta = (currentAngle - this.dragStartAngle) * (180 / Math.PI);

    this.rotationAngle = this.dragStartRotation + delta;
    this.rotationVelocity = delta * 0.15;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dom.platterDisc) {
      this.dom.platterDisc.classList.remove("scratching");
    }
  }

  startAnimationLoop() {
    const loop = () => {
      if (!this.isDragging) {
        // Inertia interpolation (smooth start & stop)
        const inertia = 0.04;
        this.rotationVelocity += (this.targetVelocity - this.rotationVelocity) * inertia;
        this.rotationAngle = (this.rotationAngle + this.rotationVelocity) % 360;
      }

      if (this.dom.platterDisc) {
        this.dom.platterDisc.style.transform = `rotate(${this.rotationAngle.toFixed(2)}deg)`;
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updateStatusDisplay() {
    if (!this.dom.statusIndicator) return;
    let statusText = "STANDBY // MOTOR OFF";
    if (this.isMotorOn && this.isNeedleDown) {
      statusText = `ACTIVE PLAYBACK // ${this.currentRpm} RPM // GROOVE ON`;
    } else if (this.isMotorOn && !this.isNeedleDown) {
      statusText = `MOTOR SPINNING // ${this.currentRpm} RPM // NEEDLE CUE UP`;
    } else if (!this.isMotorOn && this.isNeedleDown) {
      statusText = "NEEDLE ON GROOVE // MOTOR OFF [TAP POWER]";
    }
    this.dom.statusIndicator.textContent = statusText;
  }
}

if (typeof window !== "undefined") {
  window.TurntableController = TurntableController;
}
