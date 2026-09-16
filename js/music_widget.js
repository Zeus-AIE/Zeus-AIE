/**
 * STARSHIP COMMAND BRIDGE - INTERSTELLAR SPACE MUSIC WIDGET
 * Seamless integration for Interstellar Soundtrack (Hans Zimmer)
 * Supporting YouTube, Spotify, and Web Audio Space Ambient Synthesizer,
 * with dynamic 16-band holographic audio spectrum visualizer.
 */

class InterstellarMusicWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentProvider = 'youtube'; // 'youtube' | 'spotify' | 'synth'
    this.isPlaying = false;
    this.volume = 0.8;
    this.visualizerCanvas = null;
    this.vCtx = null;
    this.vAnimId = null;

    // Synth ambient state
    this.synthInterval = null;
    this.synthChords = [
      [220, 261.63, 329.63, 440],     // Am
      [174.61, 220, 261.63, 349.23],   // F
      [130.81, 164.81, 196, 261.63],   // C
      [196, 246.94, 293.66, 392]       // G
    ];
    this.chordIndex = 0;

    // Track metadata
    this.tracks = [
      {
        title: "Cornfield Chase",
        artist: "Hans Zimmer // Interstellar OST",
        youtubeId: "1V_xRb0x9aw",
        spotifyUri: "track/62aP37Kg5fi5JR2Yv0ZAv9"
      },
      {
        title: "Interstellar Main Theme (Suite)",
        artist: "Hans Zimmer // Interstellar OST",
        youtubeId: "UDVtMYqUAyw",
        spotifyUri: "album/1q3Nu77qK8mZqJ4wJcO3Xv"
      },
      {
        title: "No Time For Caution (Docking Scene)",
        artist: "Hans Zimmer // Interstellar OST",
        youtubeId: "m3gv6AZflpw",
        spotifyUri: "track/1bDb8U4P52C16nI2x1p7QG"
      },
      {
        title: "Stay",
        artist: "Hans Zimmer // Interstellar OST",
        youtubeId: "CaYpPswlB_k",
        spotifyUri: "track/0F9514eLwQ3uU9ZgV7e6hS"
      }
    ];
    this.currentTrackIndex = 0;

    this.render();
    this.initVisualizer();
  }

  render() {
    this.container.innerHTML = `
      <div class="audio-relay-panel">
        <!-- Panel Header -->
        <div class="relay-header">
          <div class="relay-title">
            <span class="beacon-dot"></span>
            <span class="title-text">SUBSPACE AUDIO RELAY // INTERSTELLAR</span>
          </div>
          <div class="relay-controls">
            <button class="hud-mini-btn" id="relay-provider-toggle" title="Switch Audio Provider">
              <span class="provider-label" id="provider-badge">YOUTUBE</span>
            </button>
            <button class="hud-mini-btn" id="relay-collapse-btn" title="Minimize / Expand Player">
              <span id="collapse-icon">▲</span>
            </button>
          </div>
        </div>

        <!-- Equalizer Spectrum Banner -->
        <div class="spectrum-container">
          <canvas id="audio-spectrum-canvas" width="280" height="32"></canvas>
          <div class="now-playing-marquee">
            <span class="marquee-text" id="now-playing-text">
              TRANSMITTING: HANS ZIMMER - CORNFIELD CHASE (INTERSTELLAR OST)
            </span>
          </div>
        </div>

        <!-- Embedded Audio Provider Frames (Expandable Drawer) -->
        <div class="relay-drawer" id="relay-drawer-body">
          <!-- Provider Tabs -->
          <div class="provider-tabs">
            <button class="tab-btn active" data-provider="youtube">YOUTUBE</button>
            <button class="tab-btn" data-provider="spotify">SPOTIFY</button>
            <button class="tab-btn" data-provider="synth">SYNTH AMBIENT</button>
          </div>

          <!-- YouTube Embed Container -->
          <div class="embed-view" id="view-youtube">
            <iframe
              id="yt-player-frame"
              width="100%"
              height="140"
              src="https://www.youtube-nocookie.com/embed/1V_xRb0x9aw?enablejsapi=1&autoplay=0&theme=dark"
              title="Hans Zimmer - Interstellar OST"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>

          <!-- Spotify Embed Container -->
          <div class="embed-view hidden" id="view-spotify">
            <iframe
              id="spotify-player-frame"
              src="https://open.spotify.com/embed/track/62aP37Kg5fi5JR2Yv0ZAv9?utm_source=generator&theme=0"
              width="100%"
              height="140"
              frameBorder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy">
            </iframe>
          </div>

          <!-- Synth Ambient View -->
          <div class="embed-view hidden" id="view-synth">
            <div class="synth-deck">
              <div class="synth-indicator">
                <span class="synth-glow"></span>
                <span>DEEP SPACE ORGAN ARPEGGIO // PROCEDURAL</span>
              </div>
              <div class="synth-actions">
                <button class="hud-action-btn" id="synth-play-btn">
                  <span>START SYNTH RELAY</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Track Selector -->
          <div class="track-selector">
            <span class="sel-label">COMM TRACK:</span>
            <select id="track-dropdown" class="hud-select">
              ${this.tracks.map((t, idx) => `
                <option value="${idx}">${t.title}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Provider switch tabs
    const tabs = this.container.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.CockpitAudio) window.CockpitAudio.playClick();
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        this.switchProvider(btn.dataset.provider);
      });
    });

    // Provider toggle button
    const provBadge = document.getElementById('relay-provider-toggle');
    if (provBadge) {
      provBadge.addEventListener('click', () => {
        if (window.CockpitAudio) window.CockpitAudio.playClick();
        const providers = ['youtube', 'spotify', 'synth'];
        const nextIdx = (providers.indexOf(this.currentProvider) + 1) % providers.length;
        const nextProv = providers[nextIdx];
        this.switchProvider(nextProv);
        tabs.forEach(t => {
          t.classList.toggle('active', t.dataset.provider === nextProv);
        });
      });
    }

    // Collapse toggle
    const collapseBtn = document.getElementById('relay-collapse-btn');
    const drawer = document.getElementById('relay-drawer-body');
    const icon = document.getElementById('collapse-icon');
    if (collapseBtn && drawer) {
      collapseBtn.addEventListener('click', () => {
        if (window.CockpitAudio) window.CockpitAudio.playClick();
        drawer.classList.toggle('collapsed');
        icon.textContent = drawer.classList.contains('collapsed') ? '▼' : '▲';
      });
    }

    // Track dropdown
    const trackDrop = document.getElementById('track-dropdown');
    if (trackDrop) {
      trackDrop.addEventListener('change', (e) => {
        this.selectTrack(parseInt(e.target.value, 10));
      });
    }

    // Synth play button
    const synthBtn = document.getElementById('synth-play-btn');
    if (synthBtn) {
      synthBtn.addEventListener('click', () => {
        if (window.CockpitAudio) window.CockpitAudio.playClick();
        this.toggleSynthAmbient();
      });
    }
  }

  switchProvider(provider) {
    this.currentProvider = provider;
    document.getElementById('provider-badge').textContent = provider.toUpperCase();

    document.getElementById('view-youtube').classList.toggle('hidden', provider !== 'youtube');
    document.getElementById('view-spotify').classList.toggle('hidden', provider !== 'spotify');
    document.getElementById('view-synth').classList.toggle('hidden', provider !== 'synth');

    if (provider !== 'synth' && this.synthInterval) {
      this.stopSynthAmbient();
    }
  }

  selectTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentTrackIndex = index;
    const track = this.tracks[index];

    document.getElementById('now-playing-text').textContent =
      `TRANSMITTING: HANS ZIMMER - ${track.title.toUpperCase()} (INTERSTELLAR OST)`;

    // Update YouTube frame
    const ytFrame = document.getElementById('yt-player-frame');
    if (ytFrame) {
      ytFrame.src = `https://www.youtube-nocookie.com/embed/${track.youtubeId}?enablejsapi=1&autoplay=1&theme=dark`;
    }

    // Update Spotify frame
    const spotFrame = document.getElementById('spotify-player-frame');
    if (spotFrame) {
      spotFrame.src = `https://open.spotify.com/embed/${track.spotifyUri}?utm_source=generator&theme=0`;
    }
  }

  // ==================== PROCEDURAL SYNTH AMBIENT FALLBACK ====================

  toggleSynthAmbient() {
    if (this.synthInterval) {
      this.stopSynthAmbient();
    } else {
      this.startSynthAmbient();
    }
  }

  startSynthAmbient() {
    if (!window.CockpitAudio) return;
    window.CockpitAudio.ensureContext();
    const ctx = window.CockpitAudio.ctx;
    if (!ctx) return;

    const btn = document.getElementById('synth-play-btn');
    if (btn) btn.innerHTML = `<span>HALT SYNTH RELAY</span>`;

    this.isPlaying = true;
    this.chordIndex = 0;

    const playChordStep = () => {
      if (!this.isPlaying || !ctx) return;
      const chord = this.synthChords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % this.synthChords.length;

      const now = ctx.currentTime;
      const duration = 3.2;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(window.CockpitAudio.masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });
    };

    playChordStep();
    this.synthInterval = setInterval(playChordStep, 3400);
  }

  stopSynthAmbient() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isPlaying = false;
    const btn = document.getElementById('synth-play-btn');
    if (btn) btn.innerHTML = `<span>START SYNTH RELAY</span>`;
  }

  // ==================== EQUALIZER VISUALIZER ====================

  initVisualizer() {
    this.visualizerCanvas = document.getElementById('audio-spectrum-canvas');
    if (!this.visualizerCanvas) return;
    this.vCtx = this.visualizerCanvas.getContext('2d');

    const bars = 24;
    const barWidth = this.visualizerCanvas.width / bars - 2;

    const draw = () => {
      const vCtx = this.vCtx;
      const w = this.visualizerCanvas.width;
      const h = this.visualizerCanvas.height;
      vCtx.clearRect(0, 0, w, h);

      const time = performance.now() * 0.004;

      for (let i = 0; i < bars; i++) {
        // Dynamic simulated wave frequencies
        const val = Math.sin(time + i * 0.35) * Math.cos(time * 0.7 - i * 0.2);
        const barHeight = Math.max(3, (Math.abs(val) * 0.85 + 0.15) * h * 0.9);

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient color for neon sci-fi aesthetic
        const grad = vCtx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#00F0FF');
        grad.addColorStop(0.6, '#38BDF8');
        grad.addColorStop(1, '#818CF8');

        vCtx.fillStyle = grad;
        vCtx.fillRect(x, y, barWidth, barHeight);
      }

      this.vAnimId = requestAnimationFrame(draw);
    };

    draw();
  }
}

// Global initialization helper
window.initMusicWidget = (containerId) => {
  window.MusicWidget = new InterstellarMusicWidget(containerId);
  return window.MusicWidget;
};
