import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const masterPath = 'public/assets/branding/wasl-logo-master.png';

if (!fs.existsSync(masterPath)) {
  console.error(`Master logo not found at ${masterPath}`);
  process.exit(1);
}

const bgColor = '#022314'; // Emerald background matching the platform's theme

async function generateWebAssets() {
  console.log('Generating web branding assets...');
  const brandingDir = 'public/assets/branding';

  // 1. Web optimized versions
  await sharp(masterPath)
    .resize(512, 512, { fit: 'contain' })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(brandingDir, 'wasl-logo.png'));

  await sharp(masterPath)
    .resize(512, 512, { fit: 'contain' })
    .webp({ quality: 95 })
    .toFile(path.join(brandingDir, 'wasl-logo.webp'));

  await sharp(masterPath)
    .resize(256, 256, { fit: 'contain' })
    .png({ quality: 95 })
    .toFile(path.join(brandingDir, 'wasl-logo-256.png'));

  await sharp(masterPath)
    .resize(128, 128, { fit: 'contain' })
    .png({ quality: 95 })
    .toFile(path.join(brandingDir, 'wasl-logo-128.png'));

  await sharp(masterPath)
    .resize(64, 64, { fit: 'contain' })
    .png({ quality: 95 })
    .toFile(path.join(brandingDir, 'wasl-logo-64.png'));

  // 2. Web App & PWA icons
  await sharp(masterPath).resize(512, 512).png().toFile('public/icon.png');
  await sharp(masterPath).resize(512, 512).png().toFile('public/icon-512.png');
  await sharp(masterPath).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(masterPath).resize(180, 180).png().toFile('public/apple-icon.png');
  await sharp(masterPath).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(masterPath).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(masterPath).resize(16, 16).png().toFile('public/favicon-16x16.png');

  // Next.js app icons
  await sharp(masterPath).resize(512, 512).png().toFile('src/app/icon.png');
  await sharp(masterPath).resize(180, 180).png().toFile('src/app/apple-icon.png');

  console.log('✓ Web and PWA assets generated successfully');
}

async function generateAndroidAssets() {
  console.log('Generating Android icons and splash drawables...');
  const resDir = 'android/app/src/main/res';
  if (!fs.existsSync(resDir)) return;

  const mipmaps = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108, innerFg: 76 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162, innerFg: 114 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216, innerFg: 152 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324, innerFg: 228 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432, innerFg: 304 },
  ];

  for (const m of mipmaps) {
    const targetFolder = path.join(resDir, m.dir);
    if (!fs.existsSync(targetFolder)) continue;

    // Standard icon
    await sharp(masterPath)
      .resize(m.size, m.size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // Round icon
    await sharp(masterPath)
      .resize(m.size, m.size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // Adaptive foreground (with safe-zone margins so circular masks don't clip the emblem corners)
    const innerEmblem = await sharp(masterPath)
      .resize(m.innerFg, m.innerFg)
      .toBuffer();

    await sharp({
      create: {
        width: m.fgSize,
        height: m.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerEmblem, gravity: 'centre' }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));
  }

  // Splash screens
  const splashes = [
    { file: 'drawable/splash.png', w: 480, h: 320 },
    { file: 'drawable-land-mdpi/splash.png', w: 480, h: 320 },
    { file: 'drawable-land-hdpi/splash.png', w: 800, h: 480 },
    { file: 'drawable-land-xhdpi/splash.png', w: 1280, h: 720 },
    { file: 'drawable-land-xxhdpi/splash.png', w: 1600, h: 960 },
    { file: 'drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280 },
    { file: 'drawable-port-mdpi/splash.png', w: 320, h: 480 },
    { file: 'drawable-port-hdpi/splash.png', w: 480, h: 800 },
    { file: 'drawable-port-xhdpi/splash.png', w: 720, h: 1280 },
    { file: 'drawable-port-xxhdpi/splash.png', w: 960, h: 1600 },
    { file: 'drawable-port-xxxhdpi/splash.png', w: 1280, h: 1920 },
  ];

  for (const s of splashes) {
    const splashPath = path.join(resDir, s.file);
    if (!fs.existsSync(path.dirname(splashPath))) continue;

    const emblemSize = Math.round(Math.min(s.w, s.h) * 0.45);
    const emblemBuf = await sharp(masterPath)
      .resize(emblemSize, emblemSize)
      .toBuffer();

    await sharp({
      create: {
        width: s.w,
        height: s.h,
        channels: 4,
        background: bgColor
      }
    })
      .composite([{ input: emblemBuf, gravity: 'centre' }])
      .png()
      .toFile(splashPath);
  }

  console.log('✓ Android icon and splash assets generated successfully');
}

async function generateIosAssets() {
  console.log('Generating iOS assets...');
  const iosDir = 'ios/App/App/Assets.xcassets';
  if (!fs.existsSync(iosDir)) return;

  const appIconPath = path.join(iosDir, 'AppIcon.appiconset/AppIcon-512@2x.png');
  if (fs.existsSync(path.dirname(appIconPath))) {
    await sharp(masterPath)
      .resize(1024, 1024)
      .png()
      .toFile(appIconPath);
  }

  const splashDir = path.join(iosDir, 'Splash.imageset');
  if (fs.existsSync(splashDir)) {
    const emblemBuf = await sharp(masterPath)
      .resize(1000, 1000)
      .toBuffer();

    const splashFiles = ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'];
    for (const f of splashFiles) {
      await sharp({
        create: {
          width: 2732,
          height: 2732,
          channels: 4,
          background: bgColor
        }
      })
        .composite([{ input: emblemBuf, gravity: 'centre' }])
        .png()
        .toFile(path.join(splashDir, f));
    }
  }

  console.log('✓ iOS icon and splash assets generated successfully');
}

(async () => {
  try {
    await generateWebAssets();
    await generateAndroidAssets();
    await generateIosAssets();
    console.log('🎉 All branding assets generated with 100% precision!');
  } catch (err) {
    console.error('Failed to generate assets:', err);
    process.exit(1);
  }
})();
