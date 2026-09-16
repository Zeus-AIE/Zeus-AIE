/**
 * STARSHIP COMMAND BRIDGE - 60 FPS SPACE SIMULATION & BUG COMBAT ENGINE
 * High-performance HTML5 Canvas physics with smooth delta-time interpolation,
 * multi-layered parallax starfields, cruising flagship ZEUS-01, varied multi-sized
 * procedural "Bug" asteroids, cybernetic target locking, and particle explosions.
 */

class SpaceCombatEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.running = false;

    // Simulation entities
    this.stars = [];
    this.nebulae = [];
    this.asteroids = [];
    this.lasers = [];
    this.particles = [];
    this.shockwaves = [];
    this.hudToasts = [];

    // Starship Zeus-01 state
    this.ship = {
      x: 180,
      y: 200,
      targetY: 200,
      angle: -0.08,
      thrustTimer: 0,
      cooldown: 0
    };

    // Targeting system
    this.pinnedBug = null;
    this.bugsEliminated = 0;
    this.autoFire = true;
    this.mousePos = { x: 0, y: 0, active: false };

    // Bug names pool for tech flavor
    this.bugNames = [
      "BUG: #404_NULL_POINTER",
      "BUG: #500_RUNTIME_CRASH",
      "BUG: #DEADLOCK_DETECTED",
      "BUG: #MEM_LEAK_OVERFLOW",
      "BUG: #RACE_CONDITION",
      "BUG: #STACK_OVERFLOW",
      "BUG: #UNHANDLED_EXCEPTION",
      "BUG: #OUT_OF_VRAM"
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Canvas interactivity
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => { this.mousePos.active = false; });
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('touchstart', (e) => this.onTouch(e), { passive: false });

    // Seed background cosmos
    this.createCosmos();

    // Start render loop
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));

    console.log("[SPACE] 60FPS Space Combat Engine ready.");
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);

    // Reposition ship proportional to viewport
    this.ship.x = Math.max(120, Math.min(220, this.width * 0.22));
    this.ship.y = this.height * 0.5;
    this.ship.targetY = this.ship.y;
  }

  createCosmos() {
    this.stars = [];
    const starCount = Math.floor(Math.max(80, this.width * 0.15));

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.8 + 0.5,
        speed: Math.random() * 0.7 + 0.15,
        color: Math.random() > 0.3 ? '#FFFFFF' : (Math.random() > 0.5 ? '#00F0FF' : '#818CF8'),
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.05 + 0.02
      });
    }

    // Nebulae dust clouds
    this.nebulae = [
      { x: this.width * 0.2, y: this.height * 0.35, rx: 220, ry: 90, color: 'rgba(99, 102, 241, 0.08)' },
      { x: this.width * 0.65, y: this.height * 0.6, rx: 320, ry: 130, color: 'rgba(0, 240, 255, 0.07)' },
      { x: this.width * 0.85, y: this.height * 0.25, rx: 180, ry: 80, color: 'rgba(139, 92, 246, 0.09)' }
    ];
  }

  spawnAsteroid() {
    // Determine category: Small, Medium, Large, Massive
    const roll = Math.random();
    let radius, hp, speed, scoreVal;

    if (roll < 0.35) {
      // Small fast bug
      radius = Math.random() * 4 + 12;
      hp = 1;
      speed = Math.random() * 1.2 + 1.8;
      scoreVal = 100;
    } else if (roll < 0.75) {
      // Medium standard bug
      radius = Math.random() * 8 + 22;
      hp = 2;
      speed = Math.random() * 0.8 + 1.1;
      scoreVal = 250;
    } else if (roll < 0.92) {
      // Large heavy bug
      radius = Math.random() * 10 + 36;
      hp = 3;
      speed = Math.random() * 0.5 + 0.7;
      scoreVal = 500;
    } else {
      // Massive boulder bug
      radius = Math.random() * 12 + 52;
      hp = 5;
      speed = Math.random() * 0.3 + 0.45;
      scoreVal = 1000;
    }

    // Generate irregular polygon vertices
    const vertexCount = Math.floor(Math.random() * 4) + 8;
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const r = radius * (0.75 + Math.random() * 0.45);
      vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }

    const name = this.bugNames[Math.floor(Math.random() * this.bugNames.length)];

    const asteroid = {
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
      x: this.width + radius + 20,
      y: Math.random() * (this.height - 120) + 60,
      vx: -speed,
      vy: (Math.random() - 0.5) * 0.4,
      radius: radius,
      baseRadius: radius,
      vertices: vertices,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.03,
      hp: hp,
      maxHp: hp,
      name: name,
      score: scoreVal,
      targeted: false,
      lockTimer: 0
    };

    this.asteroids.push(asteroid);
  }

  // ==================== INTERACTION HANDLERS ====================

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
    this.mousePos.active = true;

    // Ship smoothly tilts toward mouse Y
    this.ship.targetY = Math.max(70, Math.min(this.height - 70, this.mousePos.y));
  }

  onClick(e) {
    if (window.CockpitAudio) {
      window.CockpitAudio.ensureContext();
    }

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check if clicked directly on an asteroid ("Bug")
    let clickedBug = null;
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      const dist = Math.hypot(ast.x - mx, ast.y - my);
      if (dist <= ast.radius + 15) {
        clickedBug = ast;
        break;
      }
    }

    if (clickedBug) {
      // Pin and lock immediately
      this.pinBug(clickedBug);
      this.fireLaserAt(clickedBug.x, clickedBug.y);
    } else {
      // Free fire in direction of click
      this.fireLaserAt(mx, my);
    }
  }

  onTouch(e) {
    e.preventDefault();
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;
      this.onClick({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  pinBug(bug) {
    if (this.pinnedBug !== bug) {
      this.pinnedBug = bug;
      bug.targeted = true;
      if (window.CockpitAudio) {
        window.CockpitAudio.playTargetLock();
      }
    }
  }

  fireLaserAt(tx, ty) {
    if (this.ship.cooldown > 0) return;

    // Wingtip cannon offsets relative to ship center
    const wingOffset = 18;
    const noseX = this.ship.x + 36;

    const angleTop = Math.atan2(ty - (this.ship.y - wingOffset), tx - noseX);
    const angleBot = Math.atan2(ty - (this.ship.y + wingOffset), tx - noseX);

    const laserSpeed = 16;

    // Dual laser bolts
    this.lasers.push({
      x: noseX,
      y: this.ship.y - wingOffset,
      vx: Math.cos(angleTop) * laserSpeed,
      vy: Math.sin(angleTop) * laserSpeed,
      angle: angleTop,
      life: 80
    });

    this.lasers.push({
      x: noseX,
      y: this.ship.y + wingOffset,
      vx: Math.cos(angleBot) * laserSpeed,
      vy: Math.sin(angleBot) * laserSpeed,
      angle: angleBot,
      life: 80
    });

    if (window.CockpitAudio) {
      window.CockpitAudio.playLaser();
    }

    this.ship.cooldown = 12; // Frames cooldown
  }

  destroyBug(ast, index) {
    const scale = ast.radius / 25;
    if (window.CockpitAudio) {
      window.CockpitAudio.playExplosion(scale);
    }

    // Explosion shockwave
    this.shockwaves.push({
      x: ast.x,
      y: ast.y,
      radius: 5,
      maxRadius: ast.radius * 2.8,
      alpha: 1,
      color: '#00F0FF'
    });

    // Debris shards
    const shardCount = Math.floor(Math.min(35, ast.radius * 0.9));
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        x: ast.x,
        y: ast.y,
        vx: Math.cos(angle) * speed + ast.vx * 0.4,
        vy: Math.sin(angle) * speed + ast.vy * 0.4,
        size: Math.random() * 3.5 + 1.5,
        color: Math.random() > 0.4 ? '#38BDF8' : (Math.random() > 0.5 ? '#00F0FF' : '#94A3B8'),
        alpha: 1,
        life: Math.random() * 35 + 25
      });
    }

    // HUD elimination notification
    this.bugsEliminated++;
    this.hudToasts.push({
      text: `${ast.name} RESOLVED [+${ast.score} PTS]`,
      x: ast.x,
      y: ast.y - 20,
      alpha: 1.2,
      vy: -0.6
    });

    // Update global counters if UI listener exists
    if (window.onBugEliminated) {
      window.onBugEliminated(this.bugsEliminated, ast.score);
    }

    if (this.pinnedBug === ast) {
      this.pinnedBug = null;
    }

    this.asteroids.splice(index, 1);
  }

  // ==================== MAIN 60 FPS LOOP ====================

  loop(currentTime) {
    if (!this.running) return;

    const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. Ship movement & physics
    this.ship.y += (this.ship.targetY - this.ship.y) * 0.08;
    this.ship.angle = (this.ship.targetY - this.ship.y) * 0.0018 - 0.06;
    this.ship.thrustTimer += dt;
    if (this.ship.cooldown > 0) this.ship.cooldown--;

    // 2. Stars scrolling
    for (const star of this.stars) {
      star.x -= star.speed;
      star.twinkle += star.twinkleSpeed;
      if (star.x < 0) {
        star.x = this.width + 5;
        star.y = Math.random() * this.height;
      }
    }

    // 3. Spawn Asteroids dynamically
    if (this.asteroids.length < 5 && Math.random() < 0.022) {
      this.spawnAsteroid();
    }

    // 4. Update Asteroids ("Bug")
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      ast.x += ast.vx;
      ast.y += ast.vy;
      ast.angle += ast.angularVelocity;

      // Offscreen check
      if (ast.x < -ast.radius * 2) {
        if (this.pinnedBug === ast) this.pinnedBug = null;
        this.asteroids.splice(i, 1);
        continue;
      }

      // Pin nearest bug automatically if none pinned
      if (!this.pinnedBug && ast.x < this.width * 0.85 && ast.x > this.ship.x + 80) {
        this.pinBug(ast);
      }

      // Auto-fire combat computer
      if (this.autoFire && this.ship.cooldown <= 0 && ast.x < this.width * 0.75 && ast.x > this.ship.x + 40) {
        // Target leading calculation
        const leadX = ast.x + ast.vx * 10;
        const leadY = ast.y + ast.vy * 10;
        this.pinBug(ast);
        this.fireLaserAt(leadX, leadY);
      }
    }

    // 5. Update Lasers & Collision Detection
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.x += laser.vx;
      laser.y += laser.vy;
      laser.life--;

      if (laser.life <= 0 || laser.x > this.width + 50 || laser.y < -50 || laser.y > this.height + 50) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Collision with any asteroid
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const ast = this.asteroids[j];
        const dist = Math.hypot(ast.x - laser.x, ast.y - laser.y);

        if (dist <= ast.radius + 6) {
          ast.hp--;
          // Remove laser
          this.lasers.splice(i, 1);

          if (ast.hp <= 0) {
            this.destroyBug(ast, j);
          } else {
            // Spark hit
            for (let s = 0; s < 5; s++) {
              this.particles.push({
                x: laser.x,
                y: laser.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 2,
                color: '#FFFFFF',
                alpha: 1,
                life: 12
              });
            }
          }
          break;
        }
      }
    }

    // 6. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / 35);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 7. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += 2.5;
      s.alpha -= 0.035;
      if (s.alpha <= 0) this.shockwaves.splice(i, 1);
    }

    // 8. Update HUD Notifications
    for (let i = this.hudToasts.length - 1; i >= 0; i--) {
      const t = this.hudToasts[i];
      t.y += t.vy;
      t.alpha -= 0.02;
      if (t.alpha <= 0) this.hudToasts.splice(i, 1);
    }
  }

  // ==================== RENDERING PIPELINE ====================

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Deep Space Background & Nebulae
    for (const n of this.nebulae) {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Parallax Stars
    for (const star of this.stars) {
      const alpha = 0.5 + 0.5 * Math.sin(star.twinkle);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Shockwaves
    for (const s of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Asteroids ("Bug")
    for (const ast of this.asteroids) {
      this.drawAsteroid(ast);
    }

    // 5. Lasers
    for (const laser of this.lasers) {
      ctx.save();
      ctx.translate(laser.x, laser.y);
      ctx.rotate(laser.angle);

      // Core bolt
      const grad = ctx.createLinearGradient(-16, 0, 16, 0);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(0.3, '#00F0FF');
      grad.addColorStop(1, '#FFFFFF');

      ctx.fillStyle = grad;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.fillRect(-16, -2.5, 32, 5);

      ctx.restore();
    }

    // 6. Debris Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Flagship ZEUS-01
    this.drawShip();

    // 8. HUD Toast Messages
    for (const t of this.hudToasts) {
      ctx.save();
      ctx.font = '700 11px "Space Grotesk", monospace';
      ctx.fillStyle = '#00F0FF';
      ctx.globalAlpha = Math.min(1, t.alpha);
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  drawShip() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.ship.x, this.ship.y);
    ctx.rotate(this.ship.angle);

    // Ion Plasma Thruster Jet
    const pulse = 1 + 0.35 * Math.sin(this.ship.thrustTimer * 25);
    const trailGrad = ctx.createLinearGradient(0, 0, -45 * pulse, 0);
    trailGrad.addColorStop(0, '#FFFFFF');
    trailGrad.addColorStop(0.3, '#00F0FF');
    trailGrad.addColorStop(0.8, '#38BDF8');
    trailGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = trailGrad;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 14;

    // Center thruster
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-48 * pulse, 0);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();

    // Side thrusters
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-8, -12);
    ctx.lineTo(-28 * pulse, -12);
    ctx.lineTo(-8, -10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(-28 * pulse, 12);
    ctx.lineTo(-8, 12);
    ctx.closePath();
    ctx.fill();

    // Starship Hull Design
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#38BDF8';

    // Main body
    ctx.fillStyle = '#07122e';
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(-12, -22);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-6, 8);
    ctx.lineTo(-12, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wings & Armor plates
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(-8, -18);
    ctx.lineTo(-2, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(14, 6);
    ctx.lineTo(-8, 18);
    ctx.lineTo(-2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit Canopy Glow
    const canopyGrad = ctx.createLinearGradient(0, 0, 22, 0);
    canopyGrad.addColorStop(0, '#00F0FF');
    canopyGrad.addColorStop(1, '#FFFFFF');

    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.ellipse(10, 0, 12, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Callsign Tag
    ctx.font = '700 8.5px "Space Grotesk", monospace';
    ctx.fillStyle = '#00F0FF';
    ctx.textAlign = 'center';
    ctx.fillText('ZEUS-01', 6, -26);

    ctx.restore();
  }

  drawAsteroid(ast) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.angle);

    // Asteroid Body
    const grad = ctx.createRadialGradient(
      -ast.radius * 0.3,
      -ast.radius * 0.3,
      ast.radius * 0.1,
      0,
      0,
      ast.radius
    );
    grad.addColorStop(0, '#64748B');
    grad.addColorStop(0.5, '#334155');
    grad.addColorStop(1, '#0F172A');

    ctx.fillStyle = grad;
    ctx.strokeStyle = ast.targeted ? '#EF4444' : '#475569';
    ctx.lineWidth = ast.targeted ? 1.8 : 1.2;

    ctx.beginPath();
    ctx.moveTo(ast.vertices[0].x, ast.vertices[0].y);
    for (let i = 1; i < ast.vertices.length; i++) {
      ctx.lineTo(ast.vertices[i].x, ast.vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle Craters
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(-ast.radius * 0.25, -ast.radius * 0.15, ast.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ast.radius * 0.3, ast.radius * 0.25, ast.radius * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ==================== CYBERNETIC TARGET LOCKING ("Bug") ====================
    // User requirement: "và khi ghim đặt tên cho nó là Bug"
    if (ast.targeted || this.pinnedBug === ast) {
      this.drawTargetReticle(ast);
    }
  }

  drawTargetReticle(ast) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(ast.x, ast.y);

    const r = ast.radius + 14;
    const time = performance.now() * 0.003;

    // Segmented Rotating Reticle Ring
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 8;

    // 4 Corner brackets
    const bracketSize = 9;
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(-r, -r + bracketSize);
    ctx.lineTo(-r, -r);
    ctx.lineTo(-r + bracketSize, -r);
    // Top-Right
    ctx.moveTo(r - bracketSize, -r);
    ctx.lineTo(r, -r);
    ctx.lineTo(r, -r + bracketSize);
    // Bottom-Left
    ctx.moveTo(-r, r - bracketSize);
    ctx.lineTo(-r, r);
    ctx.lineTo(-r + bracketSize, r);
    // Bottom-Right
    ctx.moveTo(r - bracketSize, r);
    ctx.lineTo(r, r);
    ctx.lineTo(r, r - bracketSize);
    ctx.stroke();

    // Distance calculation relative to ship
    const distKm = Math.floor(Math.hypot(ast.x - this.ship.x, ast.y - this.ship.y) * 4.2);

    // ==================== "BUG" PINNED LABEL ====================
    ctx.font = '700 9.5px "Space Grotesk", monospace';
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 6;

    // Primary Bug Label
    ctx.fillText(`[TARGET: BUG]`, 0, -r - 14);

    // Secondary Telemetry: Bug ID & Distance
    ctx.font = '600 8px "Space Grotesk", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.fillText(ast.name, 0, -r - 4);
    ctx.fillText(`RANGE: ${distKm} KM`, 0, r + 14);

    // HP Bar
    if (ast.maxHp > 1) {
      const barW = ast.radius * 1.6;
      const barH = 3;
      const pct = ast.hp / ast.maxHp;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(-barW / 2, r + 20, barW, barH);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-barW / 2, r + 20, barW * pct, barH);
    }

    ctx.restore();
  }
}

// Global initialization helper
window.initSpaceCombat = (canvasId) => {
  window.SpaceEngine = new SpaceCombatEngine(canvasId);
  return window.SpaceEngine;
};
