/**
 * STARSHIP COMMAND BRIDGE - WEB AUDIO SYNTHESIZER ENGINE
 * Zero-dependency procedural audio generator for laser blasts, explosions,
 * target locking beeps, UI chirps, and bridge ambient drone.
 */

class CockpitAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sfxEnabled = true;
    this.ambientEnabled = true;
    this.masterGain = null;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.ambientLfo = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      if (this.ambientEnabled) {
        this.startAmbientHum();
      }
      console.log("[AUDIO] Starship Web Audio Engine initialized.");
    } catch (e) {
      console.warn("[AUDIO] Web Audio API not supported or blocked:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, val));
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // ==================== PROCEDURAL SOUND SYNTHESIZERS ====================

  /**
   * Twin Plasma Laser Cannon Blast
   */
  playLaser() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.18;

    // Dual pitch-dropping oscillators
    [-15, 15].forEach((detune, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(920 + detune, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + duration);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration);
    });

    // High frequency noise transient for punch
    this._playNoiseBurst(0.04, 2500, 0.15);
  }

  /**
   * Asteroid / Bug Disintegration Explosion (Sub-bass rumble + debris noise)
   */
  playExplosion(scale = 1.0) {
    if (this.isMuted || !this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.55 * Math.max(0.7, Math.min(1.6, scale));

    // Deep sub-bass pulse
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(24, t + duration);

    subGain.gain.setValueAtTime(0.5 * scale, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start(t);
    subOsc.stop(t + duration);

    // Filtered noise crackle
    this._playNoiseBurst(duration, 480, 0.4 * scale);
  }

  /**
   * Pinned / Target Locked Beep (Chirp)
   */
  playTargetLock() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t);
    osc.frequency.setValueAtTime(2349, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * UI Click Cybernetic Blip
   */
  playClick() {
    if (this.isMuted || !this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Ambient Starship Cockpit Engine Hum
   */
  startAmbientHum() {
    if (!this.ctx || this.ambientOsc) return;

    const t = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(120, t);

    this.ambientOsc.type = 'sawtooth';
    this.ambientOsc.frequency.setValueAtTime(55, t); // Deep 55Hz engine drone

    this.ambientGain.gain.setValueAtTime(0.04, t);

    // Subtle gentle modulation
    this.ambientLfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.ambientLfo.frequency.setValueAtTime(0.2, t);
    lfoGain.gain.setValueAtTime(0.015, t);

    this.ambientLfo.connect(lfoGain);
    lfoGain.connect(this.ambientGain.gain);

    this.ambientOsc.connect(lowpass);
    lowpass.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc.start();
    this.ambientLfo.start();
  }

  stopAmbientHum() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientLfo.stop();
      } catch (e) {}
      this.ambientOsc = null;
      this.ambientLfo = null;
    }
  }

  _playNoiseBurst(duration, cutoffFreq, gainVal) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffFreq, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(this.ctx.currentTime);
  }
}

// Global instance
window.CockpitAudio = new CockpitAudioEngine();
