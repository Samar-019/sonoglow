// ========================================================
// AFTERGLOW CELESTIAL LIVING ENGINE (Spatial Micro-Physics & Living Animations)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Create and inject ambient celestial stardust canvas
  const backdrop = document.getElementById('backdrop');
  let canvas = document.getElementById('celestial-stardust');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'celestial-stardust';
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.insertBefore(canvas, backdrop.nextSibling);
    } else {
      document.body.prepend(canvas);
    }
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

  const particleColors = [
    { r: 155, g: 217, b: 220 }, // Celestial Cyan
    { r: 197, g: 177, b: 231 }, // Radiant Lavender
    { r: 131, g: 153, b: 255 }, // Star Indigo
    { r: 254, g: 215, b: 170 }  // Solar Gold
  ];

  const particleCount = 65;
  const particles = Array.from({ length: particleCount }, () => {
    const col = particleColors[Math.floor(Math.random() * particleColors.length)];
    return {
      x: Math.random() * (w || 1200),
      y: Math.random() * (h || 800),
      vx: (Math.random() - 0.5) * 0.45,
      vy: -0.2 - Math.random() * 0.35,
      size: Math.random() * 2.2 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.35,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      pulsePhase: Math.random() * Math.PI * 2,
      color: col
    };
  });

  function renderStardust() {
    ctx.clearRect(0, 0, w, h);
    const isPlaying = document.body.classList.contains('playing');
    const speedMult = isPlaying ? 1.45 : 1.0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;
      p.pulsePhase += p.pulseSpeed;

      if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.hypot(dx, dy);

      // Subtle pulse and mouse proximity flare
      const pulse = Math.sin(p.pulsePhase) * 0.2;
      let alpha = Math.max(0.15, Math.min(1.0, p.baseAlpha + pulse));

      if (dist < 130) {
        alpha = Math.min(1.0, alpha + (1 - dist / 130) * 0.65);
        p.x += dx * 0.012; // gentle gravitation
        p.y += dy * 0.012;
      }

      // 1. Soft glowing halo
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
      halo.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.85})`);
      halo.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.35})`);
      halo.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // 2. Bright core star
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, alpha + 0.3)})`;
      ctx.fill();

      // 3. Delicate celestial constellation threads
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 95) {
          const lineAlpha = (1 - d / 95) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(155, 217, 220, ${lineAlpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(renderStardust);
  }
  renderStardust();

  // 2. Carousel Inbuilt Navigation Button Click Handlers
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Try to click neighbor card slot -1 first
      const leftNeighbor = document.querySelector('.cover-flow .album-neighbor[data-slot="-1"]');
      if (leftNeighbor) {
        leftNeighbor.click();
      } else {
        const prevSongBtn = document.getElementById('previous-button');
        if (prevSongBtn) prevSongBtn.click();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Try to click neighbor card slot 1 first
      const rightNeighbor = document.querySelector('.cover-flow .album-neighbor[data-slot="1"]');
      if (rightNeighbor) {
        rightNeighbor.click();
      } else {
        const nextSongBtn = document.getElementById('next-button');
        if (nextSongBtn) nextSongBtn.click();
      }
    });
  }

  // 3. Volume Slider UI Sync & Pill Gradient Fill
  const volSlider = document.getElementById('volume');
  if (volSlider) {
    function syncVolumeFill() {
      const val = Number(volSlider.value) || 0;
      volSlider.style.setProperty('--vol-fill', `${val}%`);
    }
    volSlider.addEventListener('input', syncVolumeFill);
    volSlider.addEventListener('change', syncVolumeFill);
    syncVolumeFill();

    const volObserver = new MutationObserver(syncVolumeFill);
    volObserver.observe(volSlider, { attributes: true, attributeFilter: ['value'] });
  }

  // 4. Specular cursor light sheen on player dock
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

  // 5. Zero-G magnetic micro-physics on dock and topbar buttons
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

      if (dist < 50) {
        const pullX = dx * 0.24;
        const pullY = dy * 0.24;
        btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
      } else if (btn.style.transform) {
        btn.style.transform = '';
      }
    });
  });
});
