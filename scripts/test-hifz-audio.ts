import {
  calculateGlobalAyahNumber,
  resolveAyahAudioSource,
  getArabicAudioErrorMessage,
  EVERY_AYAH_FOLDERS,
  AyahAudioPlayerController,
} from '../src/services/quranAyahAudioService';
import { RECITERS_LIST, SURAHS_LIST } from '../src/data/quranMetadata';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`, details || '');
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   Running Wasl Islamic — Hifz Audio Pipeline Tests   ');
  console.log('======================================================\n');

  // Test 1: Global Ayah Number Calculation
  console.log('[Test Group 1: Global Verse Calculation]');
  assert(
    calculateGlobalAyahNumber(1, 1) === 1,
    'Al-Fatihah Verse 1 is Global Verse 1'
  );
  assert(
    calculateGlobalAyahNumber(1, 7) === 7,
    'Al-Fatihah Verse 7 is Global Verse 7'
  );
  assert(
    calculateGlobalAyahNumber(2, 1) === 8,
    'Al-Baqarah Verse 1 is Global Verse 8'
  );
  assert(
    calculateGlobalAyahNumber(2, 255) === 262,
    'Ayat Al-Kursi (Al-Baqarah 255) is Global Verse 262'
  );
  const calcMulk = calculateGlobalAyahNumber(67, 1);
  assert(
    calcMulk === 5242,
    `Al-Mulk Verse 1 is Global Verse ${calcMulk}`
  );
  assert(
    calculateGlobalAyahNumber(114, 6) === 6236,
    'An-Nas Verse 6 is Global Verse 6236 (Last Ayah in Quran)'
  );

  // Test 2: Audio URL Resolution for Valid Inputs
  console.log('\n[Test Group 2: Audio URL Resolution & Providers]');
  const resFatihah = resolveAyahAudioSource({
    surahNumber: 1,
    ayahNumberInSurah: 1,
    reciterId: 'ar.alafasy',
  });
  assert(resFatihah.valid === true, 'Al-Fatihah 1 resolves as valid');
  assert(
    resFatihah.primaryUrl === 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    'Primary URL matches Islamic Network CDN format'
  );
  assert(
    resFatihah.fallbackUrl === 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
    'Fallback URL matches EveryAyah CDN format with padded digits'
  );

  const resMulk = resolveAyahAudioSource({
    surahNumber: 67,
    ayahNumberInSurah: 1,
    reciterId: 'ar.husary',
  });
  assert(resMulk.valid === true, 'Al-Mulk 1 with Al-Husary resolves as valid');
  assert(
    resMulk.primaryUrl === 'https://cdn.islamic.network/quran/audio/128/ar.husary/5242.mp3',
    'Primary URL uses correct global ayah 5242'
  );
  assert(
    resMulk.fallbackUrl === 'https://everyayah.com/data/Husary_128kbps/067001.mp3',
    'Fallback URL uses 067001.mp3'
  );

  // Test 3: All Verified Reciters have mappings and valid resolutions
  console.log('\n[Test Group 3: Verified Reciters Coverage]');
  for (const reciter of RECITERS_LIST) {
    const res = resolveAyahAudioSource({
      surahNumber: 112,
      ayahNumberInSurah: 1,
      reciterId: reciter.id,
    });
    assert(
      res.valid && res.primaryUrl.startsWith('https://') && res.fallbackUrl.startsWith('https://'),
      `Reciter ${reciter.nameAr} (${reciter.id}) resolves with valid HTTPS primary & fallback`
    );
    assert(
      Boolean(EVERY_AYAH_FOLDERS[reciter.id]),
      `Reciter ${reciter.id} has EveryAyah folder mapping: ${EVERY_AYAH_FOLDERS[reciter.id]}`
    );
  }

  // Test 4: Invalid Inputs Handled with Arabic Errors
  console.log('\n[Test Group 4: Invalid Input Validation]');
  const invalidSurah = resolveAyahAudioSource({
    surahNumber: 150,
    ayahNumberInSurah: 1,
  });
  assert(
    !invalidSurah.valid && typeof invalidSurah.error === 'string' && invalidSurah.error.includes('رقم السورة'),
    'Surah 150 rejected with Arabic message'
  );

  const invalidAyah = resolveAyahAudioSource({
    surahNumber: 1,
    ayahNumberInSurah: 20,
  });
  assert(
    !invalidAyah.valid && typeof invalidAyah.error === 'string' && invalidAyah.error.includes('رقم الآية'),
    'Al-Fatihah Ayah 20 rejected with Arabic message (only 7 ayahs exist)'
  );

  // Test 5: Arabic Error Messaging System
  console.log('\n[Test Group 5: Arabic Error Messaging]');
  assert(
    getArabicAudioErrorMessage('network').includes('تحقق من اتصال الإنترنت'),
    'Network error gives connectivity advice'
  );
  assert(
    getArabicAudioErrorMessage('not_allowed').includes('اضغط تشغيل لبدء التلاوة'),
    'Autoplay restriction gives user click prompt'
  );
  assert(
    getArabicAudioErrorMessage('timeout').includes('استغرق تحميل التلاوة وقتًا طويلًا'),
    'Timeout gives timeout advice'
  );
  assert(
    getArabicAudioErrorMessage('unavailable').includes('التلاوة غير متاحة حاليًا'),
    'Unavailable gives clear status'
  );

  // Test 6: Live CDN HTTP Verification (HEAD requests)
  console.log('\n[Test Group 6: Live CDN Connectivity]');
  try {
    const headResPrimary = await fetch(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
      { method: 'HEAD' }
    );
    assert(headResPrimary.ok, 'Islamic Network CDN responded 200 OK for Al-Fatihah 1');

    const headResFallback = await fetch(
      'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
      { method: 'HEAD' }
    );
    assert(headResFallback.ok, 'EveryAyah CDN responded 200 OK for 001001.mp3');
  } catch (err: any) {
    console.warn('Network fetch test notice:', err.message);
  }

  // Summary
  console.log('\n======================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
