/**
 * VINYL REAL-TIME WAVEFORM & SPECTRUM VISUALIZER
 * Renders technical brutalist oscilloscope and frequency matrix on HTML5 Canvas.
 */

class AudioVisualizer {
  constructor(canvas, audioEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audio = audioEngine;
    this.animId = null;
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
  }

  start() {
    const render = () => {
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Dark technical brutalist slate background
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    const gridCols = 8;
    const gridRows = 4;
    for (let c = 1; c < gridCols; c++) {
      const x = (width / gridCols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let r = 1; r < gridRows; r++) {
      const y = (height / gridRows) * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const freqData = this.audio ? this.audio.getFrequencyData() : new Uint8Array(64);
    const barsCount = 36;
    const barWidth = (width / barsCount) * 0.75;
    const gap = (width / barsCount) * 0.25;

    for (let i = 0; i < barsCount; i++) {
      const dataIndex = Math.floor((i / barsCount) * (freqData.length * 0.75));
      const value = freqData[dataIndex] || (this.audio && this.audio.isPlaying ? 20 + Math.random() * 30 : 6);
      const barHeight = Math.max(3, (value / 255) * (height * 0.82));
      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight - 4;

      // Color scheme: neon fuchsia gradient to electric cyan
      const gradient = ctx.createLinearGradient(0, height, 0, y);
      gradient.addColorStop(0, "#ff2a85");
      gradient.addColorStop(0.5, "#8a2be2");
      gradient.addColorStop(1, "#00f0ff");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Peak highlight dot
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y - 2, barWidth, 1.5);
    }

    // Technical frequency annotations
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = `${Math.max(9, Math.floor(height * 0.09))}px monospace`;
    ctx.fillText("20 Hz", 8, height - 6);
    ctx.fillText("1 kHz", width * 0.48, height - 6);
    ctx.fillText("20 kHz", width - 48, height - 6);
  }
}

if (typeof window !== "undefined") {
  window.AudioVisualizer = AudioVisualizer;
}
