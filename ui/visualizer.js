/* Sonoglow — Cosmic Visualizer
   Stardust particles + Soundwave/EQ canvas animation for the main desktop app.
   Reads `playback.playing` from the global playback object set by app.js.
*/
(function initSonoVisualizerMain() {
  'use strict';

  // ── Helper: is music playing? ──────────────────────────────────────────────
  function isPlaying() {
    return typeof playback !== 'undefined' && !!playback.playing;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Canvas 1 — Ambient Stardust Particles
  // ══════════════════════════════════════════════════════════════════════════
  (function initStardust() {
    const canvas = document.getElementById('main-stardust');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x:      Math.random() * window.innerWidth,
        y:      Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.5,
        vx:     (Math.random() - 0.5) * 0.35,
        vy:     (Math.random() - 0.5) * 0.35,
        alpha:  Math.random() * 0.6 + 0.2,
        pulse:  Math.random() * Math.PI
      });
    }

    function render() {
      ctx.clearRect(0, 0, w, h);
      const speed = isPlaying() ? 1.6 : 1.0;
      for (const p of particles) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        p.pulse += 0.02;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const a = Math.max(0.05, p.alpha + Math.sin(p.pulse) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155, 217, 220, ${a})`;
        ctx.fill();
      }
      requestAnimationFrame(render);
    }
    render();
  })();

  // ══════════════════════════════════════════════════════════════════════════
  //  Canvas 2 — Soundwave + EQ Bars Visualizer
  // ══════════════════════════════════════════════════════════════════════════
  (function initSoundwave() {
    const canvas = document.getElementById('main-soundwave');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Procedural frequency simulation (no real Web Audio analyser needed)
    const freqData = new Float32Array(32);
    let freqPhase = 0;

    function simulateFreq() {
      freqPhase += 0.04;
      for (let i = 0; i < 32; i++) {
        // Smooth multi-sine to mimic real EQ data
        const target = Math.abs(
          Math.sin(freqPhase + i * 0.31) * 0.5 +
          Math.sin(freqPhase * 1.7 + i * 0.17) * 0.3 +
          Math.sin(freqPhase * 0.6 - i * 0.22) * 0.2
        );
        // Lerp towards target for smooth response
        freqData[i] += (target - freqData[i]) * 0.18;
      }
    }

    let phase = 0;

    function render() {
      ctx.clearRect(0, 0, w, h);
      const playing = isPlaying();
      phase += playing ? 0.05 : 0.015;

      if (playing) simulateFreq();
      else {
        // Decay towards zero when paused
        for (let i = 0; i < 32; i++) freqData[i] *= 0.95;
      }

      const segments = 40;
      const sliceW   = w / segments;

      // ── Primary cyan wave ─────────────────────────────────────────────────
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const x        = i * sliceW;
        const freqNorm = freqData[i % 32];
        const amp      = playing ? (20 + freqNorm * 45) : 8;
        const y        = (h / 2) + Math.sin(phase + i * 0.28) * amp * Math.cos(phase * 0.5 + i * 0.1);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = playing ? 'rgba(155, 217, 220, 0.75)' : 'rgba(131, 153, 255, 0.35)';
      ctx.lineWidth   = playing ? 2.5 : 1.5;
      ctx.shadowBlur  = playing ? 18 : 6;
      ctx.shadowColor = '#9bd9dc';
      ctx.stroke();

      // ── Secondary violet wave ─────────────────────────────────────────────
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const x        = i * sliceW;
        const freqNorm = freqData[(i + 4) % 32];
        const amp      = playing ? (15 + freqNorm * 35) : 6;
        const y        = (h / 2) + Math.sin(phase * 1.3 - i * 0.22) * amp;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = playing ? 'rgba(197, 177, 231, 0.6)' : 'rgba(197, 177, 231, 0.2)';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = playing ? 14 : 4;
      ctx.shadowColor = '#c5b1e7';
      ctx.stroke();

      // ── EQ bars (only when playing) ───────────────────────────────────────
      if (playing) {
        const barCount = 24;
        const barWidth = 3;
        const gap      = (w - barCount * barWidth) / (barCount + 1);
        for (let i = 0; i < barCount; i++) {
          const val  = freqData[i % 32];
          const barH = Math.max(4, val * h * 0.65);
          const bx   = gap + i * (barWidth + gap);
          const by   = h - barH;
          const grad = ctx.createLinearGradient(0, by, 0, h);
          grad.addColorStop(0, 'rgba(155, 217, 220, 0.8)');
          grad.addColorStop(1, 'rgba(131, 153, 255, 0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(bx, by, barWidth, barH);
        }
      }

      requestAnimationFrame(render);
    }
    render();
  })();
})();
