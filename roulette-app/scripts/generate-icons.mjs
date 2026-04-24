import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../assets');

const COLORS = {
  segments: ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'],
  pink: '#e8367a',
  yellow: '#f5c800',
  white: '#ffffff',
  darkHub: '#333333',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSegments(cx, cy, r, innerR, count) {
  const paths = [];
  const sweep = 360 / count;
  for (let i = 0; i < count; i++) {
    const start = i * sweep;
    const end = start + sweep;
    const p1 = polarToCartesian(cx, cy, r, start);
    const p2 = polarToCartesian(cx, cy, r, end);
    const ip1 = polarToCartesian(cx, cy, innerR, start);
    const ip2 = polarToCartesian(cx, cy, innerR, end);
    const large = sweep > 180 ? 1 : 0;
    const d = [
      `M ${ip1.x} ${ip1.y}`,
      `L ${p1.x} ${p1.y}`,
      `A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`,
      `L ${ip2.x} ${ip2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ip1.x} ${ip1.y}`,
      'Z',
    ].join(' ');
    paths.push(`<path d="${d}" fill="${COLORS.segments[i]}" stroke="#fff" stroke-width="4"/>`);
  }
  return paths.join('\n  ');
}

function buildSpokes(cx, cy, outerR, innerR, count) {
  const lines = [];
  const sweep = 360 / count;
  for (let i = 0; i < count; i++) {
    const angle = i * sweep;
    const p1 = polarToCartesian(cx, cy, innerR, angle);
    const p2 = polarToCartesian(cx, cy, outerR, angle);
    lines.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#fff" stroke-width="5" opacity="0.8"/>`);
  }
  return lines.join('\n  ');
}

function buildWheel(cx, cy, scale = 1) {
  const r = 440 * scale;
  const ringR = 460 * scale;
  const innerR = 180 * scale;
  const hubR = 70 * scale;
  const pinR = 52 * scale;
  const dotR = 28 * scale;
  const tipR = 12 * scale;

  return `
  ${buildSegments(cx, cy, r, innerR, 8)}
  ${buildSpokes(cx, cy, r, innerR, 8)}
  <!-- outer ring glow -->
  <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="#fff" stroke-width="${54 * scale}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${COLORS.pink}" stroke-width="${42 * scale}"/>
  <!-- inner accent ring -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#fff" stroke-width="${20 * scale}"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${COLORS.yellow}" stroke-width="${14 * scale}"/>
  <!-- hub -->
  <circle cx="${cx}" cy="${cy}" r="${hubR}" fill="#fff"/>
  <circle cx="${cx}" cy="${cy}" r="${pinR}" fill="${COLORS.yellow}"/>
  <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="#fff"/>
  <circle cx="${cx}" cy="${cy}" r="${tipR}" fill="${COLORS.pink}"/>`;
}

function buildBeerMug(cx, cy, scale = 1) {
  const bx = cx - 44 * scale;
  const by = cy - 58 * scale;
  const bw = 88 * scale;
  const bh = 110 * scale;
  const rx = 12 * scale;
  return `
  <!-- beer mug body -->
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${rx}" ry="${rx}"
        fill="${COLORS.yellow}" stroke="#ca8a04" stroke-width="${4 * scale}"/>
  <!-- foam bumps -->
  <circle cx="${cx - 22 * scale}" cy="${by - 4 * scale}" r="${16 * scale}" fill="#fff"/>
  <circle cx="${cx}" cy="${by - 8 * scale}" r="${19 * scale}" fill="#fff"/>
  <circle cx="${cx + 22 * scale}" cy="${by - 4 * scale}" r="${15 * scale}" fill="#fff"/>
  <ellipse cx="${cx}" cy="${by + 2 * scale}" rx="${44 * scale}" ry="${14 * scale}" fill="#fff"/>
  <!-- handle -->
  <path d="M ${bx + bw} ${by + 18 * scale}
           Q ${bx + bw + 46 * scale} ${by + 18 * scale}
             ${bx + bw + 46 * scale} ${by + 55 * scale}
           Q ${bx + bw + 46 * scale} ${by + 92 * scale}
             ${bx + bw} ${by + 92 * scale}"
        fill="none" stroke="${COLORS.yellow}" stroke-width="${18 * scale}"
        stroke-linecap="round"/>
  <path d="M ${bx + bw} ${by + 18 * scale}
           Q ${bx + bw + 46 * scale} ${by + 18 * scale}
             ${bx + bw + 46 * scale} ${by + 55 * scale}
           Q ${bx + bw + 46 * scale} ${by + 92 * scale}
             ${bx + bw} ${by + 92 * scale}"
        fill="none" stroke="#ca8a04" stroke-width="${6 * scale}"
        stroke-linecap="round"/>
  <!-- bubbles -->
  <circle cx="${cx - 14 * scale}" cy="${by + 70 * scale}" r="${6 * scale}" fill="rgba(255,255,255,0.55)"/>
  <circle cx="${cx + 8 * scale}" cy="${by + 50 * scale}" r="${5 * scale}" fill="rgba(255,255,255,0.45)"/>
  <circle cx="${cx + 18 * scale}" cy="${by + 78 * scale}" r="${4 * scale}" fill="rgba(255,255,255,0.5)"/>`;
}

function buildIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <!-- white background -->
  <circle cx="512" cy="512" r="512" fill="#fff"/>
  ${buildWheel(512, 435, 1)}
  ${buildBeerMug(512, 435, 1)}
  <!-- title text with white outline to separate from ring -->
  <text x="512" y="968" font-family="sans-serif" font-weight="900" font-size="72"
        fill="${COLORS.pink}" text-anchor="middle" letter-spacing="4"
        stroke="#fff" stroke-width="14" paint-order="stroke fill">DRINKING</text>
  <text x="512" y="1014" font-family="sans-serif" font-weight="900" font-size="54"
        fill="${COLORS.yellow}" text-anchor="middle" letter-spacing="6"
        stroke="#fff" stroke-width="12" paint-order="stroke fill">ROULETTE</text>
</svg>`;
}

function buildAdaptiveSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  ${buildWheel(512, 512, 0.88)}
</svg>`;
}

function buildSplashSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  ${buildWheel(512, 420, 1)}
  ${buildBeerMug(512, 420, 1)}
  <!-- title text with white outline -->
  <text x="512" y="955" font-family="sans-serif" font-weight="900" font-size="72"
        fill="${COLORS.pink}" text-anchor="middle" letter-spacing="4"
        stroke="#fff" stroke-width="14" paint-order="stroke fill">DRINKING</text>
  <text x="512" y="1006" font-family="sans-serif" font-weight="900" font-size="54"
        fill="${COLORS.yellow}" text-anchor="middle" letter-spacing="6"
        stroke="#fff" stroke-width="12" paint-order="stroke fill">ROULETTE</text>
</svg>`;
}

function buildFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="#fff"/>
  ${buildWheel(512, 512, 0.95)}
</svg>`;
}

const outputs = [
  { svg: buildIconSvg(),     file: 'icon.png',          size: 1024 },
  { svg: buildAdaptiveSvg(), file: 'adaptive-icon.png', size: 1024 },
  { svg: buildSplashSvg(),   file: 'splash-icon.png',   size: 512  },
  { svg: buildFaviconSvg(),  file: 'favicon.png',       size: 192  },
];

for (const { svg, file, size } of outputs) {
  const outPath = path.join(assetsDir, file);
  try {
    await sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'fill' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ ${file} (${size}x${size})`);
  } catch (err) {
    console.error(`✗ ${file}:`, err.message);
    process.exit(1);
  }
}

console.log('\nAll icons generated successfully.');
