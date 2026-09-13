const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputImagePath = 'C:/Users/Al-shbili/.gemini/antigravity-ide/brain/30728a02-fd00-4c9e-91eb-0f22c2361703/.user_uploaded/media_1789320552323.png';
const outputDir = path.resolve(__dirname, '../public/branding');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processBranding() {
  console.log('Loading input image from:', inputImagePath);
  const metadata = await sharp(inputImagePath).metadata();
  console.log('Input metadata:', metadata);

  // 1. Extract Light Half (0, 0, 512, 512)
  const lightBuffer = await sharp(inputImagePath)
    .extract({ left: 0, top: 0, width: 512, height: 512 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 2. Extract Dark Half (512, 0, 512, 512)
  const darkBuffer = await sharp(inputImagePath)
    .extract({ left: 512, top: 0, width: 512, height: 512 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = 512, h = 512;

  // --- PROCESS LIGHT LOGO (Transparent Background) ---
  const lData = lightBuffer.data;
  const lOut = Buffer.alloc(w * h * 4);

  // Bounds for light content: x from 40 to 475, y from 95 to 385
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = lData[idx];
      const g = lData[idx + 1];
      const b = lData[idx + 2];

      // Strict clip outside content region to eliminate seam/edge artifacts
      if (x < 35 || x > 475 || y < 90 || y > 390) {
        lOut[idx] = 0;
        lOut[idx + 1] = 0;
        lOut[idx + 2] = 0;
        lOut[idx + 3] = 0;
        continue;
      }

      // Background is near white ~ (253, 253, 254)
      const diffR = 254 - r;
      const diffG = 254 - g;
      const diffB = 254 - b;
      const maxDiff = Math.max(diffR, diffG, diffB);

      if (maxDiff < 8) {
        // Pure background
        lOut[idx] = 0;
        lOut[idx + 1] = 0;
        lOut[idx + 2] = 0;
        lOut[idx + 3] = 0;
      } else {
        let alpha = 255;
        if (maxDiff < 60) {
          alpha = Math.min(255, Math.round((maxDiff / 60) * 255));
        }

        const aNorm = alpha / 255;
        // De-blend from background (254, 254, 254)
        const fgR = Math.max(0, Math.min(255, Math.round((r - (1 - aNorm) * 254) / aNorm)));
        const fgG = Math.max(0, Math.min(255, Math.round((g - (1 - aNorm) * 254) / aNorm)));
        const fgB = Math.max(0, Math.min(255, Math.round((b - (1 - aNorm) * 254) / aNorm)));

        lOut[idx] = fgR;
        lOut[idx + 1] = fgG;
        lOut[idx + 2] = fgB;
        lOut[idx + 3] = alpha;
      }
    }
  }

  // --- PROCESS DARK LOGO (Transparent Background) ---
  const dData = darkBuffer.data;
  const dOut = Buffer.alloc(w * h * 4);

  // Background in raw-dark is dark green ~ (8, 42, 33)
  const bgR = 8, bgG = 42, bgB = 33;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = dData[idx];
      const g = dData[idx + 1];
      const b = dData[idx + 2];

      // Strict clip outside content region to eliminate seam/edge artifacts
      if (x < 35 || x > 475 || y < 90 || y > 390) {
        dOut[idx] = 0;
        dOut[idx + 1] = 0;
        dOut[idx + 2] = 0;
        dOut[idx + 3] = 0;
        continue;
      }

      // Detect background vs foreground
      const isGold = (r > 45 && (r - b > 12 || r - g > -15));
      const isWhite = (r > 70 && g > 80 && b > 70);

      if (!isGold && !isWhite && r < 25 && g < 65 && b < 55) {
        dOut[idx] = 0;
        dOut[idx + 1] = 0;
        dOut[idx + 2] = 0;
        dOut[idx + 3] = 0;
      } else {
        const diffR = Math.max(0, r - bgR);
        const diffG = Math.max(0, g - bgG);
        const diffB = Math.max(0, b - bgB);

        let alpha = 255;
        if (isWhite) {
          const luma = (r + g + b) / 3;
          if (luma < 180) {
            alpha = Math.min(255, Math.max(0, Math.round((luma - 35) * 1.7)));
          }
        } else if (isGold) {
          if (r < 170) {
            alpha = Math.min(255, Math.max(0, Math.round((r - bgR) * 1.8)));
          }
        } else {
          alpha = Math.min(255, Math.max(0, Math.round(Math.max(diffR, diffG, diffB) * 1.8)));
        }

        if (alpha < 15) {
          dOut[idx] = 0;
          dOut[idx + 1] = 0;
          dOut[idx + 2] = 0;
          dOut[idx + 3] = 0;
        } else {
          const aNorm = alpha / 255;
          const fgR = Math.max(0, Math.min(255, Math.round((r - (1 - aNorm) * bgR) / aNorm)));
          const fgG = Math.max(0, Math.min(255, Math.round((g - (1 - aNorm) * bgG) / aNorm)));
          const fgB = Math.max(0, Math.min(255, Math.round((b - (1 - aNorm) * bgB) / aNorm)));

          dOut[idx] = fgR;
          dOut[idx + 1] = fgG;
          dOut[idx + 2] = fgB;
          dOut[idx + 3] = alpha;
        }
      }
    }
  }

  // Convert raw buffers to sharp instances
  const lightSharp = sharp(lOut, { raw: { width: w, height: h, channels: 4 } });
  const darkSharp = sharp(dOut, { raw: { width: w, height: h, channels: 4 } });

  // Get trimmed buffers and metadata
  const lTrimmedBuffer = await lightSharp.clone().trim().png().toBuffer();
  const dTrimmedBuffer = await darkSharp.clone().trim().png().toBuffer();

  const lTrimMeta = await sharp(lTrimmedBuffer).metadata();
  const dTrimMeta = await sharp(dTrimmedBuffer).metadata();

  console.log('Light trimmed size:', lTrimMeta.width, 'x', lTrimMeta.height);
  console.log('Dark trimmed size:', dTrimMeta.width, 'x', dTrimMeta.height);

  // Standardization: Canvas dimensions for full logo
  // Both logos have ~420 x 274 content.
  // We place each logo into a standardized 840 x 548 (2x Retina) canvas with even margin padding.
  const targetW = 840;
  const targetH = 548;

  // Render Full Light Logo
  const lightFullBuffer = await sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: await sharp(lTrimmedBuffer).resize({ width: 780, height: 508, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  // Render Full Dark Logo
  const darkFullBuffer = await sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: await sharp(dTrimmedBuffer).resize({ width: 780, height: 508, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  // Save Full PNG and WebP
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-light.png'), lightFullBuffer);
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-dark.png'), darkFullBuffer);

  await sharp(lightFullBuffer).webp({ quality: 95 }).toFile(path.join(outputDir, 'wasl-islamic-light.webp'));
  await sharp(darkFullBuffer).webp({ quality: 95 }).toFile(path.join(outputDir, 'wasl-islamic-dark.webp'));

  // Save Full SVGs (SVG vector container with embedded crisp Retina PNG)
  const lBase64 = lightFullBuffer.toString('base64');
  const dBase64 = darkFullBuffer.toString('base64');

  const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetW} ${targetH}" width="${targetW}" height="${targetH}">
  <image href="data:image/png;base64,${lBase64}" x="0" y="0" width="${targetW}" height="${targetH}" />
</svg>`;

  const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetW} ${targetH}" width="${targetW}" height="${targetH}">
  <image href="data:image/png;base64,${dBase64}" x="0" y="0" width="${targetW}" height="${targetH}" />
</svg>`;

  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-light.svg'), lightSvg);
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-dark.svg'), darkSvg);

  // --- EXTRACT ARCH & CRESCENT ICONS (Square 512x512) ---
  // The arch in the 512x512 raw buffer is located roughly from x=290 to x=470, y=100 to y=375
  const lIconExtracted = await sharp(lOut, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: 285, top: 95, width: 185, height: 285 })
    .png()
    .toBuffer();
  const lIconTrimmed = await sharp(lIconExtracted).trim().png().toBuffer();

  const dIconExtracted = await sharp(dOut, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: 285, top: 95, width: 185, height: 285 })
    .png()
    .toBuffer();
  const dIconTrimmed = await sharp(dIconExtracted).trim().png().toBuffer();

  // Create 512x512 square canvas with centered arch icon
  const lightIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: await sharp(lIconTrimmed).resize({ width: 440, height: 440, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  const darkIconBuffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: await sharp(dIconTrimmed).resize({ width: 440, height: 440, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  // Save Icon PNG and WebP
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-icon-light.png'), lightIconBuffer);
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-icon-dark.png'), darkIconBuffer);

  await sharp(lightIconBuffer).webp({ quality: 95 }).toFile(path.join(outputDir, 'wasl-islamic-icon-light.webp'));
  await sharp(darkIconBuffer).webp({ quality: 95 }).toFile(path.join(outputDir, 'wasl-islamic-icon-dark.webp'));

  // Save Icon SVGs
  const lIconBase64 = lightIconBuffer.toString('base64');
  const dIconBase64 = darkIconBuffer.toString('base64');

  const lightIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${lIconBase64}" x="0" y="0" width="512" height="512" />
</svg>`;

  const darkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${dIconBase64}" x="0" y="0" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-icon-light.svg'), lightIconSvg);
  fs.writeFileSync(path.join(outputDir, 'wasl-islamic-icon-dark.svg'), darkIconSvg);

  // Favicons
  await sharp(lightIconBuffer).resize(64, 64).png().toFile(path.join(outputDir, 'favicon-light.png'));
  await sharp(darkIconBuffer).resize(64, 64).png().toFile(path.join(outputDir, 'favicon-dark.png'));

  // Apple touch icon (180x180) on brand emerald #062e24
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 6, g: 46, b: 36, alpha: 255 }
    }
  })
    .composite([{
      input: await sharp(darkIconBuffer).resize(140, 140, { fit: 'contain' }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  // Open Graph Cards (1200x630)
  // Light OG Card
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 253, g: 253, b: 254, alpha: 255 }
    }
  })
    .composite([{
      input: await sharp(lightFullBuffer).resize(800, 520, { fit: 'contain' }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toFile(path.join(outputDir, 'og-image-light.png'));

  // Dark OG Card
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 6, g: 46, b: 36, alpha: 255 }
    }
  })
    .composite([{
      input: await sharp(darkFullBuffer).resize(800, 520, { fit: 'contain' }).toBuffer(),
      gravity: 'center'
    }])
    .png()
    .toFile(path.join(outputDir, 'og-image-dark.png'));

  console.log('✅ ALL BRANDING ASSETS GENERATED SUCCESSFULLY IN', outputDir);
}

processBranding().catch(console.error);
