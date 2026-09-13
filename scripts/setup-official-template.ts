import sharp from 'sharp';

async function measureExact() {
  const { data, info } = await sharp('public/wasl-islamic-share-template.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const cx = Math.round(w / 2); // 341

  // 1. Dark Green Plaque vertical extent at cx = 341
  let greenTop = -1, greenBottom = -1;
  for (let y = 200; y < 300; y++) {
    const idx = (y * w + cx) * 3;
    const isDarkGreen = data[idx] < 20 && data[idx+1] > 20 && data[idx+1] < 60 && data[idx+2] < 50;
    if (isDarkGreen) {
      if (greenTop === -1) greenTop = y;
      greenBottom = y;
    }
  }

  // Horizontal extent of green plaque at its vertical center
  const greenCenterY = Math.round((greenTop + greenBottom) / 2);
  let greenLeft = -1, greenRight = -1;
  for (let x = 100; x < 582; x++) {
    const idx = (greenCenterY * w + x) * 3;
    const isDarkGreen = data[idx] < 20 && data[idx+1] > 20 && data[idx+1] < 60 && data[idx+2] < 50;
    if (isDarkGreen) {
      if (greenLeft === -1) greenLeft = x;
      greenRight = x;
    }
  }

  console.log('Green Plaque (at 1x 682x1024):', {
    top: greenTop,
    bottom: greenBottom,
    height: greenBottom - greenTop,
    centerY: greenCenterY,
    left: greenLeft,
    right: greenRight,
    width: greenRight - greenLeft,
    centerX: Math.round((greenLeft + greenRight) / 2)
  });
  console.log('Green Plaque (at 2x 1364x2048):', {
    top: greenTop * 2,
    bottom: greenBottom * 2,
    height: (greenBottom - greenTop) * 2,
    centerY: greenCenterY * 2,
    left: greenLeft * 2,
    right: greenRight * 2,
    width: (greenRight - greenLeft) * 2,
    centerX: Math.round((greenLeft + greenRight) / 2) * 2
  });

  // 2. Cream Plaque vertical extent at cx = 341
  let creamTop = -1, creamBottom = -1;
  for (let y = 280; y < 350; y++) {
    const idx = (y * w + cx) * 3;
    const isCream = data[idx] > 230 && data[idx+1] > 220 && data[idx+2] > 200;
    if (isCream) {
      if (creamTop === -1) creamTop = y;
      creamBottom = y;
    }
  }
  const creamCenterY = Math.round((creamTop + creamBottom) / 2);
  let creamLeft = -1, creamRight = -1;
  for (let x = 200; x < 482; x++) {
    const idx = (creamCenterY * w + x) * 3;
    const isCream = data[idx] > 230 && data[idx+1] > 220 && data[idx+2] > 200;
    if (isCream) {
      if (creamLeft === -1) creamLeft = x;
      creamRight = x;
    }
  }

  console.log('Cream Plaque (at 1x 682x1024):', {
    top: creamTop,
    bottom: creamBottom,
    height: creamBottom - creamTop,
    centerY: creamCenterY,
    left: creamLeft,
    right: creamRight,
    width: creamRight - creamLeft,
    centerX: Math.round((creamLeft + creamRight) / 2)
  });
  console.log('Cream Plaque (at 2x 1364x2048):', {
    top: creamTop * 2,
    bottom: creamBottom * 2,
    height: (creamBottom - creamTop) * 2,
    centerY: creamCenterY * 2,
    left: creamLeft * 2,
    right: creamRight * 2,
    width: (creamRight - creamLeft) * 2,
    centerX: Math.round((creamLeft + creamRight) / 2) * 2
  });

  // 3. Golden Divider line
  for (let y = 530; y < 570; y++) {
    const idx = (y * w + cx) * 3;
    if (data[idx] > 170 && data[idx+1] > 120 && data[idx+2] < 90) {
      console.log('Golden divider line at y (1x):', y, 'at (2x):', y * 2);
      break;
    }
  }
}

measureExact().catch(console.error);
