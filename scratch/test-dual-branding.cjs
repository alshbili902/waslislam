const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const brandingDir = path.join(rootDir, 'public/branding');

console.log('====================================================');
console.log('VERIFYING DUAL INDEPENDENT BRANDING SYSTEM IMPLEMENTATION');
console.log('====================================================');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runTests() {
  // 1. Check all required assets exist in /public/branding/
  const requiredFiles = [
    'wasl-islamic-light.png',
    'wasl-islamic-light.webp',
    'wasl-islamic-light.svg',
    'wasl-islamic-dark.png',
    'wasl-islamic-dark.webp',
    'wasl-islamic-dark.svg',
    'wasl-islamic-icon-light.png',
    'wasl-islamic-icon-light.webp',
    'wasl-islamic-icon-light.svg',
    'wasl-islamic-icon-dark.png',
    'wasl-islamic-icon-dark.webp',
    'wasl-islamic-icon-dark.svg',
    'favicon-light.png',
    'favicon-dark.png',
    'apple-touch-icon.png',
    'og-image-light.png',
    'og-image-dark.png',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join(brandingDir, file);
    assert(fs.existsSync(fullPath), `Asset exists: /public/branding/${file}`);
  }

  // 2. Verify dimensions & transparency of Full Logos
  const lMeta = await sharp(path.join(brandingDir, 'wasl-islamic-light.png')).metadata();
  assert(lMeta.width === 840 && lMeta.height === 548, 'wasl-islamic-light.png dimensions are 840x548');

  const dMeta = await sharp(path.join(brandingDir, 'wasl-islamic-dark.png')).metadata();
  assert(dMeta.width === 840 && dMeta.height === 548, 'wasl-islamic-dark.png dimensions are 840x548');

  const lRaw = await sharp(path.join(brandingDir, 'wasl-islamic-light.png')).raw().toBuffer({ resolveWithObject: true });
  const dRaw = await sharp(path.join(brandingDir, 'wasl-islamic-dark.png')).raw().toBuffer({ resolveWithObject: true });

  assert(lRaw.data[3] === 0, 'wasl-islamic-light.png corner is 100% transparent (alpha=0)');
  assert(dRaw.data[3] === 0, 'wasl-islamic-dark.png corner is 100% transparent (alpha=0)');

  // 3. Verify distinct independent colors (NO CSS invert/filter)
  // Text pixel sample in light mode should be deep green
  // Text pixel sample in dark mode should be white
  const lTextSample = [lRaw.data[(160 * 840 + 150) * 4], lRaw.data[(160 * 840 + 150) * 4 + 1], lRaw.data[(160 * 840 + 150) * 4 + 2], lRaw.data[(160 * 840 + 150) * 4 + 3]];
  const dTextSample = [dRaw.data[(160 * 840 + 150) * 4], dRaw.data[(160 * 840 + 150) * 4 + 1], dRaw.data[(160 * 840 + 150) * 4 + 2], dRaw.data[(160 * 840 + 150) * 4 + 3]];

  assert(lTextSample[1] > 40 && lTextSample[0] < 20, `Light text is deep green (R=${lTextSample[0]}, G=${lTextSample[1]}, B=${lTextSample[2]})`);
  assert(dTextSample[0] > 240 && dTextSample[1] > 240 && dTextSample[2] > 240, `Dark text is crisp pure white (R=${dTextSample[0]}, G=${dTextSample[1]}, B=${dTextSample[2]})`);

  // 4. Verify dimensions of Icons (Square 512x512)
  const lIconMeta = await sharp(path.join(brandingDir, 'wasl-islamic-icon-light.png')).metadata();
  assert(lIconMeta.width === 512 && lIconMeta.height === 512, 'wasl-islamic-icon-light.png is 512x512 square');

  const dIconMeta = await sharp(path.join(brandingDir, 'wasl-islamic-icon-dark.png')).metadata();
  assert(dIconMeta.width === 512 && dIconMeta.height === 512, 'wasl-islamic-icon-dark.png is 512x512 square');

  // 5. Verify centralized branding configuration file
  const configPath = path.join(rootDir, 'src/config/branding.ts');
  assert(fs.existsSync(configPath), 'src/config/branding.ts exists');
  const configContent = fs.readFileSync(configPath, 'utf8');
  assert(configContent.includes('wasl-islamic-light.svg'), 'branding.ts points to wasl-islamic-light.svg');
  assert(configContent.includes('wasl-islamic-dark.svg'), 'branding.ts points to wasl-islamic-dark.svg');
  assert(configContent.includes('wasl-islamic-icon-light.svg'), 'branding.ts points to wasl-islamic-icon-light.svg');
  assert(configContent.includes('wasl-islamic-icon-dark.svg'), 'branding.ts points to wasl-islamic-icon-dark.svg');

  // 6. Verify BrandLogo component
  const logoCompPath = path.join(rootDir, 'src/components/brand/BrandLogo.tsx');
  const logoCompContent = fs.readFileSync(logoCompPath, 'utf8');
  assert(!logoCompContent.includes('filter: invert'), 'BrandLogo does NOT use CSS filter invert');
  assert(!logoCompContent.includes('mix-blend-mode'), 'BrandLogo does NOT use mix-blend-mode');
  assert(logoCompContent.includes('dark:hidden block'), 'BrandLogo supports zero-flash dual rendering via CSS');
  assert(logoCompContent.includes('hidden dark:block'), 'BrandLogo supports zero-flash dual rendering via CSS');

  // 7. Verify index.html favicon & OG configuration
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert(indexHtml.includes('/branding/og-image-dark.png'), 'index.html uses /branding/og-image-dark.png');
  assert(indexHtml.includes('/branding/wasl-islamic-icon-dark.svg'), 'index.html has dark SVG favicon');
  assert(indexHtml.includes('/branding/wasl-islamic-icon-light.svg'), 'index.html has light SVG favicon');

  console.log('====================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
