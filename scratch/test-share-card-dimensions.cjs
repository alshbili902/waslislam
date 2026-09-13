const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function runTests() {
  console.log('==================================================');
  console.log('   AUDITING SHARE CARD SINGLE TEMPLATE SIZE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check template file dimensions
  const t2xMeta = await sharp('public/wasl-islamic-share-template@2x.png').metadata();
  assert(t2xMeta.width === 1364 && t2xMeta.height === 2048, `wasl-islamic-share-template@2x.png is exact 1364 x 2048 (found ${t2xMeta.width}x${t2xMeta.height})`);

  const t1xMeta = await sharp('public/wasl-islamic-share-template.png').metadata();
  assert(t1xMeta.width === 682 && t1xMeta.height === 1024, `wasl-islamic-share-template.png is exact 682 x 1024 (found ${t1xMeta.width}x${t1xMeta.height})`);

  assert(
    Math.abs((t2xMeta.width / t2xMeta.height) - (t1xMeta.width / t1xMeta.height)) < 0.0001,
    'Both templates have identical aspect ratio (2:3)'
  );

  // 2. Audit src/types/share.ts
  const typesContent = fs.readFileSync('src/types/share.ts', 'utf8');
  assert(!typesContent.includes('SHARE_CARD_SIZES'), 'src/types/share.ts does NOT contain SHARE_CARD_SIZES');
  assert(!typesContent.includes('ShareCardSizePreset'), 'src/types/share.ts does NOT contain ShareCardSizePreset');
  assert(typesContent.includes('SHARE_TEMPLATE_WIDTH = 1364'), 'src/types/share.ts defines SHARE_TEMPLATE_WIDTH = 1364');
  assert(typesContent.includes('SHARE_TEMPLATE_HEIGHT = 2048'), 'src/types/share.ts defines SHARE_TEMPLATE_HEIGHT = 2048');

  // 3. Audit src/services/shareImageService.ts
  const serviceContent = fs.readFileSync('src/services/shareImageService.ts', 'utf8');
  assert(!serviceContent.includes('targetWidth'), 'src/services/shareImageService.ts does NOT contain targetWidth');
  assert(!serviceContent.includes('targetHeight'), 'src/services/shareImageService.ts does NOT contain targetHeight');
  assert(!serviceContent.includes('SHARE_CARD_SIZES'), 'src/services/shareImageService.ts does NOT contain SHARE_CARD_SIZES');
  assert(serviceContent.includes('SHARE_TEMPLATE_WIDTH'), 'src/services/shareImageService.ts uses SHARE_TEMPLATE_WIDTH');
  assert(serviceContent.includes('SHARE_TEMPLATE_HEIGHT'), 'src/services/shareImageService.ts uses SHARE_TEMPLATE_HEIGHT');

  // 4. Audit src/components/share/ShareModal.tsx
  const modalContent = fs.readFileSync('src/components/share/ShareModal.tsx', 'utf8');
  assert(!modalContent.includes('SHARE_CARD_SIZES'), 'ShareModal.tsx does NOT contain SHARE_CARD_SIZES');
  assert(!modalContent.includes('customWidth'), 'ShareModal.tsx does NOT contain customWidth');
  assert(!modalContent.includes('customHeight'), 'ShareModal.tsx does NOT contain customHeight');
  assert(!modalContent.includes('selectedSizeId'), 'ShareModal.tsx does NOT contain selectedSizeId');
  assert(!modalContent.includes('مقاس البطاقة'), 'ShareModal.tsx does NOT contain "مقاس البطاقة" UI selector');
  assert(modalContent.includes('zoomLevel'), 'ShareModal.tsx includes visual zoomLevel for preview inspection');
  assert(modalContent.includes('useModalScrollLock'), 'ShareModal.tsx retains background scroll lock');

  // 5. Test Export Image Generation at exact original template dimensions
  const testOutputPath = 'scratch/test-export-card.png';
  const testCanvas = await sharp('public/wasl-islamic-share-template@2x.png')
    .resize(1364, 2048)
    .toFile(testOutputPath);

  const exportedMeta = await sharp(testOutputPath).metadata();
  assert(
    exportedMeta.width === 1364 && exportedMeta.height === 2048,
    `Exported card has exact original dimensions: ${exportedMeta.width} x ${exportedMeta.height}`
  );

  console.log('\n==================================================');
  console.log(`   AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
