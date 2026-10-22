import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

const standardSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

// Maskable SVG with safe margin (inner 80% circle safe zone, full bleed background)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="pearlBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D2C24"/>
      <stop offset="100%" stop-color="#231A15"/>
    </linearGradient>
    <linearGradient id="roseAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D99B9B"/>
      <stop offset="100%" stop-color="#8D2434"/>
    </linearGradient>
  </defs>
  <!-- Full bleed square background -->
  <rect width="512" height="512" fill="url(#pearlBg)"/>
  
  <!-- Safe Zone Elements (scaled down to 75% centered) -->
  <g transform="translate(64, 64) scale(0.75)">
    <rect width="512" height="512" rx="112" fill="none" stroke="#D4AF37" stroke-opacity="0.3" stroke-width="4"/>
    <text x="225" y="345" font-family="Playfair Display, Georgia, serif" font-size="280" font-weight="700" font-style="italic" fill="#FAF7F2" text-anchor="middle">P</text>
    <circle cx="340" cy="180" r="32" fill="url(#roseAccent)"/>
    <circle cx="332" cy="172" r="10" fill="#FFFFFF" fill-opacity="0.75"/>
  </g>
</svg>
`;

async function generate() {
  console.log('Generating PWA icons...');

  // 1. 192x192 standard icon
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. 512x512 standard icon
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. 512x512 maskable icon
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180)
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. favicon.ico / favicon-32x32.png
  await sharp(standardSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
