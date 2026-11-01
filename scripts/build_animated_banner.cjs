const path = require('path');
const fs = require('fs');
const sharp = require('C:/Users/ASUS/AppData/Local/Microsoft/WinGet/Packages/OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe/node-v24.20.0-win-x64/node_modules/sharp-cli/node_modules/sharp');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const TARGET_WIDTH = 960;
const TARGET_HEIGHT = 300;
const NUM_FRAMES = 24;
const DELAY_MS = 75; // ~13.3 FPS, 1.8s seamless loop

function createFrameOverlaySvg(progress) {
  const phase = progress * 2 * Math.PI;

  // 1. Shimmer beam position across Sonoglow wordmark
  const shimmerCenter = -180 + progress * 720;
  const shimmerStart = shimmerCenter - 110;
  const shimmerEnd = shimmerCenter + 110;

  // 2. Pulsing live dot
  const dotPulseR = 3.5 + 4.0 * (0.5 + 0.5 * Math.sin(phase));
  const dotPulseOp = 0.85 - 0.55 * (0.5 + 0.5 * Math.sin(phase));

  // 3. Audio equalizer bars on the right
  const bars = [];
  const barCount = 13;
  const startX = 1090;
  const barSpacing = 13;
  const barYCenter = 210;

  for (let i = 0; i < barCount; i++) {
    const x = startX + i * barSpacing;
    const h1 = Math.sin(phase * 2 + i * 0.7);
    const h2 = Math.cos(phase * 3 - i * 0.5);
    const h3 = Math.sin(phase * 1 + i * 1.2);
    const normalized = Math.abs(h1 * 0.5 + h2 * 0.3 + h3 * 0.2);
    const height = 16 + normalized * 72;
    const y1 = barYCenter - height / 2;
    const y2 = barYCenter + height / 2;
    bars.push({ x, y1, y2, height });
  }

  // 4. Stardust twinkle
  const stars = [
    { cx: 240, cy: 36,  baseR: 2.0, phaseOff: 0.0 },
    { cx: 614, cy: 25,  baseR: 1.7, phaseOff: 1.3 },
    { cx: 460, cy: 22,  baseR: 1.5, phaseOff: 2.6 },
    { cx: 147, cy: 304, baseR: 1.6, phaseOff: 3.9 },
    { cx: 774, cy: 316, baseR: 1.4, phaseOff: 5.1 }
  ];

  const starElements = stars.map(s => {
    const op = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(phase + s.phaseOff));
    const r = s.baseR * (0.8 + 0.35 * Math.sin(phase + s.phaseOff));
    return `<circle cx="${s.cx}" cy="${s.cy}" r="${r.toFixed(2)}" fill="#ffffff" opacity="${op.toFixed(2)}"/>`;
  }).join('\n');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="400" viewBox="0 0 1280 400">
  <defs>
    <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="35%"  stop-color="#00e5ff" stop-opacity="0.80"/>
      <stop offset="65%"  stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="eq-grad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="#00e5ff"/>
      <stop offset="45%"  stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>

    <filter id="neon-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3.5" result="b1"/>
      <feMerge>
        <feMergeNode in="b1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <clipPath id="f-clip">
      <rect width="1280" height="400" rx="20"/>
    </clipPath>
  </defs>

  <g clip-path="url(#f-clip)">
    ${starElements}
    <circle cx="82" cy="63" r="${dotPulseR.toFixed(1)}" fill="none" stroke="#00e5ff" stroke-width="1.2" opacity="${dotPulseOp.toFixed(2)}"/>

    <mask id="word-mask">
      <text x="64" y="164"
            font-family="'Segoe UI', Arial, sans-serif"
            font-size="94" font-weight="800" letter-spacing="-3.5"
            fill="#ffffff">Sonoglow</text>
    </mask>

    <rect x="${shimmerStart.toFixed(1)}" y="80" width="${(shimmerEnd - shimmerStart).toFixed(1)}" height="110"
          fill="url(#shimmer)" mask="url(#word-mask)" opacity="0.85"/>

    <g filter="url(#neon-glow)" stroke-linecap="round" stroke-width="5.5">
      ${bars.map(b => `<line x1="${b.x}" y1="${b.y1.toFixed(1)}" x2="${b.x}" y2="${b.y2.toFixed(1)}" stroke="url(#eq-grad)"/>`).join('\n      ')}
    </g>

    <g stroke-linecap="round" stroke-width="5.5" opacity="0.15">
      ${bars.map(b => {
        const mirrorY1 = 224;
        const mirrorY2 = 224 + b.height * 0.28;
        return `<line x1="${b.x}" y1="${mirrorY1.toFixed(1)}" x2="${b.x}" y2="${mirrorY2.toFixed(1)}" stroke="url(#eq-grad)"/>`;
      }).join('\n      ')}
    </g>
  </g>
</svg>`;
}

async function buildAnimatedBanner() {
  console.log(`Starting animated banner build (${NUM_FRAMES} frames @ ${TARGET_WIDTH}x${TARGET_HEIGHT})...`);
  const bgPath = 'C:/Users/ASUS/.gemini/antigravity/scratch/sonoglow_fresh/docs/images/sonoglow_cinema_banner.png';
  const outGifPath = 'C:/Users/ASUS/.gemini/antigravity/scratch/sonoglow_fresh/docs/images/banner.gif';

  const baseBuffer = await sharp(bgPath).resize(TARGET_WIDTH, TARGET_HEIGHT).toBuffer();
  const gif = GIFEncoder();

  for (let f = 0; f < NUM_FRAMES; f++) {
    const progress = f / NUM_FRAMES;
    const svgStr = createFrameOverlaySvg(progress);
    const svgBuf = Buffer.from(svgStr);

    const overlayBuf = await sharp(svgBuf)
      .resize(TARGET_WIDTH, TARGET_HEIGHT)
      .png()
      .toBuffer();

    // Composite and get raw RGBA pixels
    const frameRaw = await sharp(baseBuffer)
      .composite([{ input: overlayBuf, top: 0, left: 0 }])
      .raw()
      .toBuffer();

    const rgba = new Uint8Array(frameRaw);
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);

    gif.writeFrame(index, TARGET_WIDTH, TARGET_HEIGHT, {
      palette,
      delay: DELAY_MS
    });

    process.stdout.write(`Encoded frame ${f + 1}/${NUM_FRAMES}\r`);
  }

  gif.finish();
  const gifBytes = Buffer.from(gif.bytes());
  fs.writeFileSync(outGifPath, gifBytes);

  console.log(`\nSUCCESS! Multi-frame animated GIF created at: ${outGifPath}`);
  console.log(`File size: ${(gifBytes.length / (1024 * 1024)).toFixed(2)} MB`);
}

buildAnimatedBanner().catch(console.error);
