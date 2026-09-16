/**
 * STARSHIP COMMAND BRIDGE - CENTRAL CONTROLLER (BRIDGE APP)
 * Ties together canvas simulation, audio synthesis, music widget,
 * real-time telemetry clocks, interactive MFD modal dossiers, and keyboard hotkeys.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Canvas Space Simulation
  const spaceEngine = window.initSpaceCombat('space-canvas');

  // 2. Initialize Interstellar Music Widget
  const musicWidget = window.initMusicWidget('music-widget-container');

  // 3. Telemetry Clocks & Metrics Loop
  initTelemetryClocks();

  // 4. Audio Control Toggles
  initAudioControls();

  // 5. MFD Interactive Modals
  initMfdModals();

  // 6. Keyboard Hotkeys
  initKeyboardHotkeys(spaceEngine);

  // 7. Bug Elimination Event Listener
  window.onBugEliminated = (count, score) => {
    const countEl = document.getElementById('bugs-destroyed-val');
    if (countEl) countEl.textContent = count.toString().padStart(3, '0');

    const scoreEl = document.getElementById('bridge-score-val');
    if (scoreEl) {
      const cur = parseInt(scoreEl.textContent.replace(/,/g, ''), 10) || 0;
      scoreEl.textContent = (cur + score).toLocaleString();
    }
  };

  // Welcome Audio initialization on first user interaction
  const initAudioOnGesture = () => {
    if (window.CockpitAudio) {
      window.CockpitAudio.init();
    }
    document.removeEventListener('click', initAudioOnGesture);
    document.removeEventListener('keydown', initAudioOnGesture);
  };
  document.addEventListener('click', initAudioOnGesture);
  document.addEventListener('keydown', initAudioOnGesture);

  console.log("[BRIDGE] Starship Command Bridge online and ready.");
});

// ==================== TELEMETRY CLOCKS ====================

function initTelemetryClocks() {
  const utcEl = document.getElementById('telemetry-utc');
  const vnEl = document.getElementById('telemetry-vn');
  const uptimeEl = document.getElementById('telemetry-uptime');

  const startTime = Date.now();

  function updateClocks() {
    const now = new Date();

    // UTC
    if (utcEl) {
      utcEl.textContent = `UTC: ${now.toUTCString().slice(17, 25)}`;
    }

    // Vietnam Time (GMT+7)
    if (vnEl) {
      const vnTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      vnEl.textContent = `CAN THO [GMT+7]: ${vnTime}`;
    }

    // Uptime
    if (uptimeEl) {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      uptimeEl.textContent = `UPTIME: 00:${m}:${s}`;
    }
  }

  setInterval(updateClocks, 1000);
  updateClocks();
}

// ==================== AUDIO CONTROLS ====================

function initAudioControls() {
  const muteBtn = document.getElementById('btn-audio-mute');
  const humBtn = document.getElementById('btn-ambient-hum');
  const fireManualBtn = document.getElementById('btn-manual-fire');

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      if (window.CockpitAudio) {
        window.CockpitAudio.ensureContext();
        const isMuted = window.CockpitAudio.toggleMute();
        muteBtn.classList.toggle('muted', isMuted);
        muteBtn.querySelector('.btn-text').textContent = isMuted ? 'AUDIO: MUTED' : 'AUDIO: ON';
      }
    });
  }

  if (humBtn) {
    humBtn.addEventListener('click', () => {
      if (window.CockpitAudio) {
        window.CockpitAudio.ensureContext();
        window.CockpitAudio.ambientEnabled = !window.CockpitAudio.ambientEnabled;
        if (window.CockpitAudio.ambientEnabled) {
          window.CockpitAudio.startAmbientHum();
          humBtn.classList.remove('off');
          humBtn.querySelector('.btn-text').textContent = 'ENGINE HUM: ON';
        } else {
          window.CockpitAudio.stopAmbientHum();
          humBtn.classList.add('off');
          humBtn.querySelector('.btn-text').textContent = 'ENGINE HUM: OFF';
        }
      }
    });
  }

  if (fireManualBtn && window.SpaceEngine) {
    fireManualBtn.addEventListener('click', () => {
      if (window.SpaceEngine.pinnedBug) {
        window.SpaceEngine.fireLaserAt(window.SpaceEngine.pinnedBug.x, window.SpaceEngine.pinnedBug.y);
      } else {
        window.SpaceEngine.fireLaserAt(window.SpaceEngine.width * 0.8, window.SpaceEngine.height * 0.5);
      }
    });
  }
}

// ==================== MFD MODAL DOSSIERS ====================

const MFD_DOSSIERS = {
  thesis: {
    title: "MFD_01 // MULTIMODAL ACTION STEP SEGMENTATION",
    subtitle: "Can Tho University Undergraduate Engineering Thesis (2025-2026)",
    content: `
      <div class="dossier-body">
        <h4>RESEARCH ARCHITECTURE & METHODOLOGY</h4>
        <p>Addresses temporal boundary ambiguity in multi-minute procedural video understanding. Integrates high-dimensional visual frame tokens with multi-channel audio spectrograms through cross-modal temporal attention mechanisms.</p>
        
        <div class="dossier-stats-grid">
          <div class="stat-card">
            <span class="stat-num">3.37 / 4.0</span>
            <span class="stat-lbl">CTU CUMULATIVE GPA</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">MULTIMODAL</span>
            <span class="stat-lbl">VISION-AUDIO FUSION</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">PYTORCH</span>
            <span class="stat-lbl">CUDA ACCELERATION</span>
          </div>
        </div>

        <h4>KEY TECHNICAL HIGHLIGHTS</h4>
        <ul>
          <li><strong>Cross-Modal Fusion:</strong> Aligns dense visual features from video backbones with audio temporal cues for precise action step boundary detection.</li>
          <li><strong>Boundary Refinement:</strong> Implemented temporal pyramid networks reducing step boundary error rates.</li>
          <li><strong>Tooling:</strong> PyTorch, Hugging Face Transformers, OpenCV, Librosa, CUDA 12.</li>
        </ul>
      </div>
    `
  },
  clinical: {
    title: "MFD_01 // CLINICAL AI & DIAGNOSIS PLATFORM",
    subtitle: "Can Tho University Software Center (CUSC) R&D Platform",
    content: `
      <div class="dossier-body">
        <h4>ENTERPRISE MEDICAL DIAGNOSIS ENGINE</h4>
        <p>Enterprise clinical platform processing semi-structured electronic medical records (EMR) and diagnostic imaging to provide clinical decision support with automated diagnosis suggestions.</p>
        
        <div class="dossier-stats-grid">
          <div class="stat-card">
            <span class="stat-num">CUSC R&D</span>
            <span class="stat-lbl">RESEARCH CENTER</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">NER & KG</span>
            <span class="stat-lbl">CLINICAL NLP</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">REST / WS</span>
            <span class="stat-lbl">HIGH-AVAILABILITY API</span>
          </div>
        </div>

        <h4>KEY TECHNICAL HIGHLIGHTS</h4>
        <ul>
          <li><strong>Entity Extraction:</strong> Fine-tuned clinical Named Entity Recognition (NER) models for medication, symptom, and dosage extraction.</li>
          <li><strong>Knowledge Graph Integration:</strong> Linked entities to biomedical ontologies for diagnostic verification.</li>
        </ul>
      </div>
    `
  },
  rlhf: {
    title: "MFD_02 // LLM POST-TRAINING, RLHF & DPO",
    subtitle: "Centific AI Alignment & LLM Safety Research",
    content: `
      <div class="dossier-body">
        <h4>FOUNDATION MODEL ALIGNMENT & PREFERENCE OPTIMIZATION</h4>
        <p>Post-training optimization workflows for Large Language Models (LLMs) applying Direct Preference Optimization (DPO), Proximal Policy Optimization (PPO), and human feedback reward modeling.</p>
        
        <div class="dossier-stats-grid">
          <div class="stat-card">
            <span class="stat-num">DPO / PPO</span>
            <span class="stat-lbl">ALIGNMENT ALGORITHMS</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">CENTIFIC</span>
            <span class="stat-lbl">RLHF CONTRIBUTOR</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">TRL & vLLM</span>
            <span class="stat-lbl">DISTRIBUTED INFRA</span>
          </div>
        </div>

        <h4>KEY TECHNICAL HIGHLIGHTS</h4>
        <ul>
          <li><strong>Preference Dataset Curation:</strong> Structured high-quality preference pair datasets for instruction following and complex reasoning.</li>
          <li><strong>Red-Teaming Evaluation:</strong> Executed adversarial jailbreak and harm assessment protocols ensuring model robustness.</li>
        </ul>
      </div>
    `
  },
  omnideck: {
    title: "MFD_03 // OMNIDECK LOW-LATENCY TELEMETRY ENGINE",
    subtitle: "Systems Engineering & Direct Windows Kernel Hardware C-APIs",
    content: `
      <div class="dossier-body">
        <h4>ULTRA-EFFICIENT HARDWARE TELEMETRY HUD</h4>
        <p>Engineered a desktop telemetry and system monitoring HUD utilizing direct Win32 C-APIs and NVIDIA NVML shared library bindings with sub-0.5% CPU overhead.</p>
        
        <div class="dossier-stats-grid">
          <div class="stat-card">
            <span class="stat-num">&lt; 0.5%</span>
            <span class="stat-lbl">CPU OVERHEAD</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">WIN32 & NVML</span>
            <span class="stat-lbl">KERNEL STREAMING</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">TAURI / C++</span>
            <span class="stat-lbl">HYBRID RUNTIME</span>
          </div>
        </div>

        <h4>DIRECT COMMUNICATIONS</h4>
        <p><strong>Primary Dispatch:</strong> <a href="mailto:lathaihoa2003@gmail.com" class="hud-link">lathaihoa2003@gmail.com</a></p>
        <p><strong>Subspace Voice Link:</strong> <a href="tel:+84865254028" class="hud-link">+84 865 254 028</a></p>
        <p><strong>Deployment Status:</strong> OPEN FOR FULL-TIME ROLES & R&D INITIATIVES</p>
      </div>
    `
  }
};

function initMfdModals() {
  const modal = document.getElementById('dossier-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalContent = document.getElementById('modal-content-slot');
  const closeBtn = document.getElementById('modal-close-btn');

  function openDossier(key) {
    const data = MFD_DOSSIERS[key];
    if (!data || !modal) return;

    if (window.CockpitAudio) {
      window.CockpitAudio.playClick();
    }

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalContent.innerHTML = data.content;

    modal.classList.remove('hidden');
  }

  function closeDossier() {
    if (window.CockpitAudio) {
      window.CockpitAudio.playClick();
    }
    if (modal) modal.classList.add('hidden');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDossier);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDossier();
    });
  }

  // Bind clickable cards in MFD screens
  document.querySelectorAll('[data-dossier]').forEach(el => {
    el.addEventListener('click', () => {
      openDossier(el.dataset.dossier);
    });
  });
}

// ==================== KEYBOARD HOTKEYS ====================

function initKeyboardHotkeys(spaceEngine) {
  window.addEventListener('keydown', (e) => {
    // Space: Fire laser
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (spaceEngine) {
        if (spaceEngine.pinnedBug) {
          spaceEngine.fireLaserAt(spaceEngine.pinnedBug.x, spaceEngine.pinnedBug.y);
        } else {
          spaceEngine.fireLaserAt(spaceEngine.width * 0.8, spaceEngine.height * 0.5);
        }
      }
    }

    // M: Toggle audio mute
    if (e.code === 'KeyM' && e.target.tagName !== 'INPUT') {
      if (window.CockpitAudio) {
        const btn = document.getElementById('btn-audio-mute');
        if (btn) btn.click();
      }
    }

    // Escape: Close modal
    if (e.code === 'Escape') {
      const modal = document.getElementById('dossier-modal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    }
  });
}
