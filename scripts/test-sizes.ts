import sharp from 'sharp';

interface SizeTest {
  name: string;
  width: number;
  height: number;
}

const sizes: SizeTest[] = [
  { name: 'public/test-size-standard-1080x1620.png', width: 1080, height: 1620 },
  { name: 'public/test-size-story-1080x1920.png', width: 1080, height: 1920 },
  { name: 'public/test-size-portrait-1080x1350.png', width: 1080, height: 1350 },
  { name: 'public/test-size-highres-1200x1800.png', width: 1200, height: 1800 },
];

async function renderCardAtSize(baseCardPath: string, targetWidth: number, targetHeight: number, outputPath: string) {
  const cardImg = sharp(baseCardPath);
  const cardMeta = await cardImg.metadata();
  const cardW = cardMeta.width || 1364;
  const cardH = cardMeta.height || 2048;

  const cardAspect = cardW / cardH;
  const targetAspect = targetWidth / targetHeight;

  if (Math.abs(cardAspect - targetAspect) < 0.01) {
    // Exact aspect ratio
    await cardImg
      .resize(targetWidth, targetHeight, { fit: 'fill', kernel: 'lanczos3' })
      .png({ quality: 100 })
      .toFile(outputPath);
  } else {
    // Different aspect ratio: maintain crisp aspect ratio with elegant ambient background
    // Calculate fitted dimensions
    let drawW: number, drawH: number;
    if (targetAspect < cardAspect) {
      // Target is narrower/taller (e.g. 9:16 Story)
      drawW = targetWidth;
      drawH = Math.round(targetWidth / cardAspect);
    } else {
      // Target is wider/shorter (e.g. 4:5 Portrait)
      drawH = targetHeight;
      drawW = Math.round(targetHeight * cardAspect);
    }

    const resizedCard = await sharp(baseCardPath)
      .resize(drawW, drawH, { fit: 'fill', kernel: 'lanczos3' })
      .toBuffer();

    // Create blurred ambient backdrop from the card itself
    const ambientBg = await sharp(baseCardPath)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .blur(40)
      .modulate({ brightness: 0.95, saturation: 0.9 })
      .toBuffer();

    const top = Math.round((targetHeight - drawH) / 2);
    const left = Math.round((targetWidth - drawW) / 2);

    await sharp(ambientBg)
      .composite([{ input: resizedCard, top, left }])
      .png({ quality: 100 })
      .toFile(outputPath);
  }
  console.log(`Saved ${outputPath} (${targetWidth}x${targetHeight})`);
}

async function runSizeTests() {
  const sampleCard = 'public/test-case-2-long-dhikr.png';
  for (const s of sizes) {
    await renderCardAtSize(sampleCard, s.width, s.height, s.name);
  }
}

runSizeTests().catch(console.error);
