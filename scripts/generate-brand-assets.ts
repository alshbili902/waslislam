import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const masterSource = 'C:/Users/Al-shbili/.gemini/antigravity-ide/brain/30728a02-fd00-4c9e-91eb-0f22c2361703/.user_uploaded/media_1789313147344.png';
const brandDir = path.resolve('public/brand');

if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

// Transparent alpha mask with mathematical defringing
async function getTransparentMaster() {
  const { data, info } = await sharp(masterSource).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const minVal = Math.min(r, g, b);

    if (minVal >= 252) {
      outData[i * 4] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
      outData[i * 4 + 3] = 0;
    } else {
      let alphaNorm;
      if (minVal > 238) {
        alphaNorm = (252 - minVal) / 14;
      } else {
        alphaNorm = 1.0;
      }

      const alpha = Math.min(255, Math.max(0, Math.round(alphaNorm * 255)));

      if (alpha === 0) {
        outData[i * 4] = 0;
        outData[i * 4 + 1] = 0;
        outData[i * 4 + 2] = 0;
        outData[i * 4 + 3] = 0;
      } else {
        const a = alpha / 255;
        const newR = Math.min(255, Math.max(0, Math.round((r - (1 - a) * 255) / a)));
        const newG = Math.min(255, Math.max(0, Math.round((g - (1 - a) * 255) / a)));
        const newB = Math.min(255, Math.max(0, Math.round((b - (1 - a) * 255) / a)));

        outData[i * 4] = newR;
        outData[i * 4 + 1] = newG;
        outData[i * 4 + 2] = newB;
        outData[i * 4 + 3] = alpha;
      }
    }
  }

  return { buffer: outData, width, height };
}

async function buildBrandAssets() {
  console.log('Generating official brand assets from master image...');
  const { buffer: rawTransBuffer, width, height } = await getTransparentMaster();
  const transparentMaster = sharp(rawTransBuffer, { raw: { width, height, channels: 4 } });

  // 1. Full Logo (Includes Icon on right + "وصل الإسلامية" + "خير دائم بين يديك" on left)
  // Precise Bounding Box: minX: 159, minY: 41, width: 708, height: 415
  // Add 16px padding for safety
  const fullCrop = {
    left: Math.max(0, 159 - 16),
    top: Math.max(0, 41 - 16),
    width: Math.min(width, 708 + 32),
    height: Math.min(height, 415 + 32),
  };

  const fullLogoBuffer = await sharp(rawTransBuffer, { raw: { width, height, channels: 4 } })
    .extract(fullCrop)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Save standard and 2x Retina WebP / PNG
  await sharp(fullLogoBuffer).png().toFile(path.join(brandDir, 'logo-full.png'));
  await sharp(fullLogoBuffer).webp({ quality: 100, lossless: true }).toFile(path.join(brandDir, 'logo-full.webp'));
  console.log('✓ Created logo-full.png & logo-full.webp');

  // 2. Compact Logo (Icon on right + "وصل الإسلامية" on left, excluding tagline)
  // Tagline starts at y: 356. So we extract until y: 356 + padding
  const compactCrop = {
    left: Math.max(0, 159 - 16),
    top: Math.max(0, 41 - 16),
    width: Math.min(width, 708 + 32),
    height: Math.min(height, (355 - 41) + 32),
  };

  const compactLogoBuffer = await sharp(rawTransBuffer, { raw: { width, height, channels: 4 } })
    .extract(compactCrop)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(compactLogoBuffer).png().toFile(path.join(brandDir, 'logo-compact.png'));
  await sharp(compactLogoBuffer).webp({ quality: 100, lossless: true }).toFile(path.join(brandDir, 'logo-compact.webp'));
  console.log('✓ Created logo-compact.png & logo-compact.webp');

  // 3. Icon Only (Mosque dome + crescent on right)
  // Icon bounds: minX: 478, minY: 41, width: 388, height: 406
  const iconCrop = {
    left: Math.max(0, 478 - 8),
    top: Math.max(0, 41 - 8),
    width: 388 + 16,
    height: 406 + 16,
  };

  const rawIconBuffer = await sharp(rawTransBuffer, { raw: { width, height, channels: 4 } })
    .extract(iconCrop)
    .png()
    .toBuffer();

  // Square centered icon with 10% safe area
  const squareIconBuffer = await sharp(rawIconBuffer)
    .resize(460, 460, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 26,
      bottom: 26,
      left: 26,
      right: 26,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  await sharp(squareIconBuffer).png().toFile(path.join(brandDir, 'logo-icon.png'));
  await sharp(squareIconBuffer).webp({ quality: 100, lossless: true }).toFile(path.join(brandDir, 'logo-icon.webp'));
  console.log('✓ Created logo-icon.png & logo-icon.webp');

  // 4. PWA and App Icons
  // Favicon 64x64 and 32x32
  await sharp(squareIconBuffer).resize(64, 64).png().toFile(path.resolve('public/favicon.png'));
  await sharp(squareIconBuffer).resize(32, 32).png().toFile(path.join(brandDir, 'favicon-32x32.png'));

  // Apple touch icon 180x180 (iOS standard with elegant emerald gradient backdrop)
  const iosBg = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 6, g: 46, b: 36, alpha: 1 } // #062e24
    }
  }).png().toBuffer();

  const iosIconScaled = await sharp(rawIconBuffer)
    .resize(136, 136, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(iosBg)
    .composite([{ input: iosIconScaled, gravity: 'center' }])
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  // PWA 192x192
  await sharp(squareIconBuffer).resize(192, 192).png().toFile(path.resolve('public/pwa-192x192.png'));

  // PWA 512x512
  await sharp(squareIconBuffer).resize(512, 512).png().toFile(path.resolve('public/pwa-512x512.png'));

  // PWA Maskable 512x512 (Strict 20% safe zone padding on #062e24 background)
  const maskableBg = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 6, g: 46, b: 36, alpha: 1 }
    }
  }).png().toBuffer();

  const maskableIconScaled = await sharp(rawIconBuffer)
    .resize(340, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(maskableBg)
    .composite([{ input: maskableIconScaled, gravity: 'center' }])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  // 5. SVG Icons (Vector wrapper with high-res base64 embedded image to ensure 100% identical look and zero loss)
  const iconBase64 = (await sharp(squareIconBuffer).png().toBuffer()).toString('base64');
  const fullBase64 = fullLogoBuffer.toString('base64');

  const svgIconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${iconBase64}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  fs.writeFileSync(path.resolve('public/icon.svg'), svgIconContent);
  fs.writeFileSync(path.join(brandDir, 'logo-icon.svg'), svgIconContent);

  const fullSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullCrop.width} ${fullCrop.height}" width="${fullCrop.width}" height="${fullCrop.height}">
  <image href="data:image/png;base64,${fullBase64}" width="${fullCrop.width}" height="${fullCrop.height}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
  fs.writeFileSync(path.join(brandDir, 'logo-full.svg'), fullSvgContent);

  console.log('✓ Generated SVG vectors & PWA icon suite successfully!');
}

buildBrandAssets().catch(console.error);
