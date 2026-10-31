// ========================================================
// AFTERGLOW CELESTIAL LIVING ENGINE (Spatial Micro-Physics & Stardust)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Create and inject ambient stardust canvas
  const backdrop = document.getElementById('backdrop');
  const canvas = document.createElement('canvas');
  canvas.id = 'celestial-stardust';
  if (backdrop && backdrop.parentNode) {
    backdrop.parentNode.insertBefore(canvas, backdrop.nextSibling);
  } else {
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const particleCount = 48;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * (w || 1200),
    y: Math.random() * (h || 800),
    vx: (Math.random() - 0.5) * 0.35,
    vy: -0.15 - Math.random() * 0.3,
    size: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function renderStardust() {
    ctx.clearRect(0, 0, w, h);
    const isPlaying = document.body.classList.contains('playing');
    const speedMult = isPlaying ? 1.4 : 1.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;

      if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.hypot(dx, dy);
      let currentAlpha = p.alpha;
      if (dist < 120) {
        currentAlpha = Math.min(1, p.alpha + (1 - dist / 120) * 0.5);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(155, 217, 220, ${currentAlpha * 0.75})`;
      ctx.fill();

      // Delicate constellation threads
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 85) {
          const lineAlpha = (1 - d / 85) * 0.14;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(131, 153, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(renderStardust);
  }
  renderStardust();

  // 2. Specular cursor light reflection on player dock
  const dock = document.getElementById('player-dock');
  if (dock) {
    dock.addEventListener('mousemove', (e) => {
      const rect = dock.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dock.style.setProperty('--dock-x', `${x}px`);
      dock.style.setProperty('--dock-y', `${y}px`);
    });
  }

  // 3. Zero-G magnetic micro-physics on dock buttons
  const magneticTargets = document.querySelectorAll(
    '.player-dock .icon-button, .player-dock .play-button, .window-tools .icon-button, .scene-tools .icon-button'
  );

  magneticTargets.forEach((btn) => btn.classList.add('celestial-magnetic'));

  window.addEventListener('mousemove', (e) => {
    magneticTargets.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 55) {
        const pullX = dx * 0.28;
        const pullY = dy * 0.28;
        btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.06)`;
      } else if (btn.style.transform) {
        btn.style.transform = '';
      }
    });
  });
});
