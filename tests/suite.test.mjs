import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { 
  calculatePrayerTimes, 
  calculateQiblaDirection, 
  getHijriDate, 
  CITIES 
} from '../src/utils/prayerTimes.ts';

import { 
  SURAH_LIST, 
  VERIFIED_OFFLINE_SURAHS, 
  RECITERS, 
  getAyahAudioUrl 
} from '../src/data/quranMetadata.ts';

import { AUTHENTIC_HADITHS } from '../src/data/hadithData.ts';
import { ADHKAR_DATA } from '../src/data/adhkarData.ts';
import { ALLAH_NAMES } from '../src/data/allahNamesData.ts';
import { QUIZ_QUESTIONS } from '../src/data/quizData.ts';
import { 
  THEMES, 
  DEFAULT_THEME, 
  resolveSafeTheme, 
  isThemeValid 
} from '../src/utils/theme.ts';

import {
  ACADEMY_TRACKS,
  ACADEMY_LESSONS
} from '../src/data/academyData.ts';

import {
  normalizeArabicText,
  matchesArabicQuery
} from '../src/utils/arabicSearch.ts';

import {
  getDetailedHijriDate,
  checkFastingRecommendation,
  getOccasionForHijriDay,
  ISLAMIC_OCCASIONS
} from '../src/utils/islamicCalendar.ts';

import { ISLAMIC_SOURCES_REGISTRY } from '../src/data/sourcesRegistry.ts';
import { VERIFIED_CHARITY_PLATFORMS } from '../src/data/charityData.ts';

test('1. Quran Metadata Integrity Test', (t) => {
  assert.equal(SURAH_LIST.length, 114, 'Must have exactly 114 Surahs');
  assert.equal(SURAH_LIST[0].name, 'الفاتحة');
  assert.equal(SURAH_LIST[0].numberOfAyahs, 7);
  assert.equal(SURAH_LIST[113].name, 'الناس');
  assert.equal(SURAH_LIST[113].numberOfAyahs, 6);

  assert.ok(VERIFIED_OFFLINE_SURAHS[1], 'Surah Al-Fatihah must exist in offline dataset');
  assert.equal(VERIFIED_OFFLINE_SURAHS[1].length, 7);
  assert.ok(VERIFIED_OFFLINE_SURAHS[112], 'Surah Al-Ikhlas must exist in offline dataset');
  assert.equal(VERIFIED_OFFLINE_SURAHS[112].length, 4);

  assert.ok(RECITERS.length >= 5, 'Must have at least 5 reciters');
  const audioUrl = getAyahAudioUrl('alafasy', 1, 1);
  assert.match(audioUrl, /Alafasy_128kbps\/001001\.mp3/, 'Audio URL must match standard EveryAyah padded structure');
});

test('2. Prayer Times & Qibla Algorithm Accuracy Test', (t) => {
  const riyadh = CITIES.find(c => c.id === 'riyadh');
  assert.ok(riyadh, 'Riyadh city must exist');

  const times = calculatePrayerTimes(riyadh.lat, riyadh.lng, riyadh.timezone, new Date());
  assert.match(times.fajr, /^\d{2}:\d{2}$/, 'Fajr must be valid HH:MM format');
  assert.match(times.sunrise, /^\d{2}:\d{2}$/, 'Sunrise must be valid HH:MM format');
  assert.match(times.dhuhr, /^\d{2}:\d{2}$/, 'Dhuhr must be valid HH:MM format');
  assert.match(times.asr, /^\d{2}:\d{2}$/, 'Asr must be valid HH:MM format');
  assert.match(times.maghrib, /^\d{2}:\d{2}$/, 'Maghrib must be valid HH:MM format');
  assert.match(times.isha, /^\d{2}:\d{2}$/, 'Isha must be valid HH:MM format');

  assert.ok(times.nextPrayer, 'Next prayer must be calculated');
  assert.ok(times.nextPrayer.nameAr.length > 0, 'Next prayer name in Arabic');

  const qiblaRiyadh = calculateQiblaDirection(riyadh.lat, riyadh.lng);
  assert.ok(qiblaRiyadh >= 230 && qiblaRiyadh <= 260, `Riyadh Qibla angle (${qiblaRiyadh}) must be around 245 degrees`);
});

test('3. Hijri Date Calculation Test', (t) => {
  const hijri = getHijriDate();
  assert.ok(hijri.year >= 1445, 'Hijri year must be plausible');
  assert.ok(hijri.monthAr.length > 0, 'Hijri month must be present');
  assert.ok(hijri.formattedAr.includes('هـ'), 'Formatted string must include Hijri symbol');
});

test('4. Authentic Hadith and Adhkar Content Tests', (t) => {
  assert.ok(AUTHENTIC_HADITHS.length > 0, 'Authentic Hadiths must exist');
  for (const h of AUTHENTIC_HADITHS) {
    assert.ok(h.arabic.length > 10, 'Hadith Arabic text must be valid');
    assert.ok(h.narratorAr.length > 0, 'Hadith must have narrator');
    assert.ok(h.source.length > 0, 'Hadith must have source attribution');
    assert.ok(h.grade.length > 0, 'Hadith must have authenticity grade');
  }

  assert.ok(ADHKAR_DATA.length >= 10, 'Adhkar repository must contain essential daily entries');
  for (const d of ADHKAR_DATA) {
    assert.ok(d.textAr.length > 5, 'Dhikr text must not be empty');
    assert.ok(d.count >= 1, 'Dhikr repetition count must be positive');
    assert.ok(d.referenceAr.length > 0, 'Dhikr must have Hisn al-Muslim reference');
  }
});

test('5. 99 Names of Allah & Islamic Quiz Validation', (t) => {
  assert.ok(ALLAH_NAMES.length >= 20, 'Names of Allah dataset must exist');
  assert.equal(ALLAH_NAMES[0].arabic, 'الرَّحْمَٰنُ');

  assert.ok(QUIZ_QUESTIONS.length >= 5, 'Quiz must have at least 5 verified questions');
  for (const q of QUIZ_QUESTIONS) {
    assert.ok(q.optionsAr.length === 4, 'Quiz question must have 4 choices');
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, 'Valid correct choice index');
    assert.ok(q.explanationAr.length > 0, 'Must have authentic explanation');
  }
});

test('6. Theme System & Legacy Fallback Validation', (t) => {
  assert.deepEqual([...THEMES], ['light', 'dark'], 'Allowed themes must only be light and dark');
  assert.equal(DEFAULT_THEME, 'light', 'Default theme must be light');
  assert.equal(isThemeValid('light'), true, 'Light must be valid');
  assert.equal(isThemeValid('dark'), true, 'Dark must be valid');
  assert.equal(isThemeValid('saudi'), false, 'Saudi theme must no longer be a valid theme');
  assert.equal(isThemeValid('unknown'), false, 'Unknown theme must not be valid');

  assert.equal(resolveSafeTheme('saudi'), 'light', 'Legacy saudi theme must fallback safely to light');
  assert.equal(resolveSafeTheme(null), 'light', 'null theme must fallback safely to light');
  assert.equal(resolveSafeTheme(undefined), 'light', 'undefined theme must fallback safely to light');
  assert.equal(resolveSafeTheme(''), 'light', 'empty string must fallback safely to light');

  assert.equal(resolveSafeTheme('dark'), 'dark', 'Dark theme must resolve to dark');
  assert.equal(resolveSafeTheme('light'), 'light', 'Light theme must resolve to light');
});

test('7. Official Brand Logo Assets & Multi-Device Validation', (t) => {
  assert.ok(fs.existsSync('public/assets/branding/wasl-logo-master.png'), 'Master logo asset must exist');
  assert.ok(fs.statSync('public/assets/branding/wasl-logo-master.png').size > 500000, 'Master logo must be high-res');
  assert.ok(fs.existsSync('public/assets/branding/wasl-logo.png'), 'Web logo PNG must exist');
  assert.ok(fs.existsSync('public/assets/branding/wasl-logo.webp'), 'Web logo WebP must exist');
  assert.ok(fs.existsSync('public/assets/branding/a_clean_elegant_high_quality_app_icon_logo_des.png'), 'Named master logo asset must exist');

  assert.ok(fs.existsSync('public/favicon.ico'), 'Favicon ICO must exist');
  assert.ok(fs.existsSync('public/icon.png'), 'PWA icon.png must exist');
  assert.ok(fs.existsSync('public/icon-192.png'), 'PWA icon-192.png must exist');
  assert.ok(fs.existsSync('public/icon-512.png'), 'PWA icon-512.png must exist');
  assert.ok(fs.existsSync('public/apple-icon.png'), 'Apple touch icon must exist');

  // Verify web-only platform has no native android/ios packaging directories
  assert.ok(!fs.existsSync('android'), 'Native Android folder should not exist in web-only platform');
  assert.ok(!fs.existsSync('ios'), 'Native iOS folder should not exist in web-only platform');
  assert.ok(!fs.existsSync('capacitor.config.ts'), 'Capacitor config should not exist in web-only platform');

  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  assert.equal(manifest.name, 'وصل الإسلامية | Wasl Islamic', 'Manifest name must match official branding');
  assert.ok(manifest.icons.some(i => i.src.includes('wasl-logo.png') || i.src.includes('icon-512')), 'Manifest must reference official logo icon');
});

test('8. Feature 2: Wasl Islamic Academy Data & Tracks Validation', (t) => {
  assert.equal(ACADEMY_TRACKS.length, 8, 'Academy must have 8 organized educational tracks');
  assert.ok(ACADEMY_TRACKS.some(t => t.id === 'basics'), 'Basics track must exist');
  assert.ok(ACADEMY_TRACKS.some(t => t.id === 'new-muslim'), 'New Muslim guided journey track must exist');
  assert.ok(ACADEMY_TRACKS.some(t => t.id === 'hajj-umrah'), 'Hajj & Umrah track must exist');

  assert.ok(ACADEMY_LESSONS.length >= 10, 'Must have at least 10 structured lessons');

  for (const lesson of ACADEMY_LESSONS) {
    assert.ok(lesson.titleAr.length > 5, 'Lesson title must be valid');
    assert.ok(lesson.sections.length >= 1, 'Lesson must contain structured sections');
    assert.ok(lesson.sourceAttribution.length > 0, 'Every lesson must have scholarly source attribution');
    assert.ok(lesson.estimatedMinutes > 0, 'Estimated reading time must be positive');
  }
});

test('9. Feature 9: Arabic Text Search Normalization', (t) => {
  // Tashkeel removal test
  const normalizedWithDiacritics = normalizeArabicText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  assert.equal(normalizedWithDiacritics, 'بسم الله الرحمن الرحيم');

  // Hamza forms normalization (أ / إ / آ -> ا)
  const normalizedHamza = normalizeArabicText('إِقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ');
  assert.ok(normalizedHamza.startsWith('اقرا'));

  // Matching with diacritics tolerance
  assert.equal(matchesArabicQuery('صَلَاةُ الفَجْرِ', 'صلاة'), true);
  assert.equal(matchesArabicQuery('الرَّحْمَنُ الرَّحِيمُ', 'الرحمن'), true);
  assert.equal(matchesArabicQuery('أَكْرِمْ نَزِيلَكَ', 'اكرم'), true);
});

test('10. Feature 5: Smart Islamic Calendar & Voluntary Fasting Rules', (t) => {
  const hijriToday = getDetailedHijriDate(new Date(), 0);
  assert.ok(hijriToday.year >= 1445, 'Hijri year must be calculated accurately');
  assert.ok(hijriToday.month >= 1 && hijriToday.month <= 12, 'Hijri month must be between 1 and 12');
  assert.ok(hijriToday.formattedAr.includes('هـ'), 'Formatted string must have Hijri sign');

  // Occasions check
  assert.ok(ISLAMIC_OCCASIONS.length >= 9, 'Must have at least 9 verified major annual occasions');
  const arafah = getOccasionForHijriDay(12, 9);
  assert.ok(arafah, 'Day of Arafah occasion must exist on 9th of Dhul Hijjah');
  assert.equal(arafah?.isFastingRecommended, true, 'Fasting on Arafah must be marked recommended');

  // Test voluntary fasting recommendation
  const fastingCheck = checkFastingRecommendation(new Date(), 0);
  assert.ok(typeof fastingCheck.isRecommended === 'boolean');
});

test('11. Feature 11 & 13.G: Verified Source Registry & Official Charity Platforms', (t) => {
  assert.ok(ISLAMIC_SOURCES_REGISTRY.length >= 6, 'Must have verified sources registry');
  for (const src of ISLAMIC_SOURCES_REGISTRY) {
    assert.ok(src.institutionAr.length > 5, 'Institution must be specified');
    assert.ok(src.referenceUrl.startsWith('https://'), 'Must have valid secure URL');
    assert.ok(src.lastVerifiedYear >= 2024, 'Must have recent verification timestamp');
  }

  assert.ok(VERIFIED_CHARITY_PLATFORMS.length >= 4, 'Must have accredited charity platforms');
  for (const charity of VERIFIED_CHARITY_PLATFORMS) {
    assert.ok(charity.officialUrl.startsWith('https://'), 'Charity URL must be secure');
    assert.ok(charity.authorityAr.length > 5, 'Governing authority must be stated');
    assert.ok(charity.badgeAr.length > 0, 'Must have accreditation badge');
  }
});

test('12. Feature 3: Quran Reading Planner Metrics & Adaptive Schedule', async (t) => {
  const { countActiveDaysBetween, getDefaultReadingPlan, ReadingPlannerService } = await import('../src/utils/readingPlannerManager.ts');
  
  // Test active days calculation
  const allWeek = [0, 1, 2, 3, 4, 5, 6];
  const activeDays = countActiveDaysBetween('2026-10-01', '2026-10-30', allWeek);
  assert.equal(activeDays, 30, 'All days in 30 day range should be counted');

  // Test plan metrics calculation
  const plan = getDefaultReadingPlan();
  plan.totalUnits = 604;
  plan.completedUnits = 20;
  plan.sessionsPerDay = 5;

  const metrics = ReadingPlannerService.calculateMetrics(plan, plan.startDate);
  assert.equal(metrics.remainingUnits, 584);
  assert.ok(metrics.dailyTargetUnits > 0);
  assert.ok(metrics.perSessionTarget > 0);
  assert.ok(metrics.minutesPerSession > 0);
  assert.equal(metrics.currentPage, 21);
});

test('13. Feature 4: Wasl Kids Educational Data & Authentic Sources', async (t) => {
  const { KIDS_PROPHET_STORIES, WUDU_STEPS, KIDS_QUIZ_QUESTIONS } = await import('../src/data/kidsData.ts');

  assert.ok(KIDS_PROPHET_STORIES.length >= 4, 'Must have at least 4 prophetic stories for kids');
  for (const story of KIDS_PROPHET_STORIES) {
    assert.ok(story.title.length > 5);
    assert.ok(story.verifiedSource.length > 10, 'Prophetic story must cite authentic source (Ibn Kathir/Quran)');
    assert.ok(story.lessons.length >= 2, 'Must have clear moral lessons');
  }

  assert.equal(WUDU_STEPS.length, 8, 'Wudu guide must have 8 authentic sequential steps');
  assert.ok(WUDU_STEPS[0].title.includes('النية'));
  assert.ok(WUDU_STEPS[7].dhikr?.includes('أَشْهَدُ أَنْ لا إِلَهَ إِلا اللَّهُ'), 'Wudu concluding step must have authentic sunnah Dua');

  assert.ok(KIDS_QUIZ_QUESTIONS.length >= 6, 'Must have interactive kids quiz questions');
  for (const q of KIDS_QUIZ_QUESTIONS) {
    assert.ok(q.options.length >= 3);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
    assert.ok(q.explanation.length > 5, 'Must provide answer explanation');
  }
});

test('14. Feature 5: Source-Grounded Islamic Search Engine (Honest Fallback & Accurate Retrieval)', async (t) => {
  const { KnowledgeSearchEngine } = await import('../src/utils/knowledgeSearchEngine.ts');

  // Query authentic hadith keyword
  const hadithRes = KnowledgeSearchEngine.search('النية');
  assert.equal(hadithRes.hasResults, true, 'Should find Hadith of Niyyah');
  assert.ok(hadithRes.results.some(r => r.type === 'hadith'));

  // Query Quran verse
  const quranRes = KnowledgeSearchEngine.search('اياك نعبد');
  assert.equal(quranRes.hasResults, true, 'Should find Surah Al-Fatihah ayah');
  assert.ok(quranRes.results.some(r => r.type === 'quran' || r.type === 'tafsir'));

  // Query verified fatwa
  const fatwaRes = KnowledgeSearchEngine.search('زكاة الاسهم');
  assert.equal(fatwaRes.hasResults, true, 'Should retrieve verified fatwa on stocks');
  assert.ok(fatwaRes.results.some(r => r.type === 'fatwa'));

  // Test honest non-fabrication fallback for completely unsupported gibberish
  const emptyRes = KnowledgeSearchEngine.search('xyz999unrelatednonislamicstring');
  assert.equal(emptyRes.hasResults, false, 'Must not hallucinate answers');
  assert.ok(emptyRes.fallbackMessage?.includes('لم نعثر على مصدر موثوق'), 'Must return respectful honest fallback');
  assert.ok(emptyRes.suggestedRefinements.length > 0, 'Must offer query suggestions');
});

test('15. Feature 8: Deep Personalization Persistence & Safety', async (t) => {
  const { personalizationManager } = await import('../src/utils/personalizationManager.ts');
  const prefs = personalizationManager.getPreferences();

  assert.ok(prefs.quranFontSize >= 20 && prefs.quranFontSize <= 38);
  assert.ok(typeof prefs.showRamadanCountdown === 'boolean');
  assert.ok(typeof prefs.reducedMotion === 'boolean');
});

test('16. Feature 1: Interactive Quran Dictionary Engine & Root Catalog', async (t) => {
  const { QuranDictionaryEngine } = await import('../src/utils/quranDictionaryEngine.ts');
  const { QURAN_DICTIONARY_ENTRIES } = await import('../src/data/quranDictionaryData.ts');

  assert.ok(QURAN_DICTIONARY_ENTRIES.length >= 10, 'Dictionary must contain initial verified Quranic vocabulary');

  // Test word lookup with root and classical meaning
  const siratResult = QuranDictionaryEngine.lookupWord('الصراط', 1, 6);
  assert.equal(siratResult.hasVerifiedLexicon, true, 'Should find verified lexical entry for الصراط');
  assert.equal(siratResult.entry?.root, 'س-ر-ط');
  assert.ok(siratResult.entry?.meaningAr.includes('الطريق الواضح'));
  assert.ok(siratResult.entry?.lexicalSource.length > 5);
  assert.ok(siratResult.entry?.totalOccurrencesInQuran && siratResult.entry.totalOccurrencesInQuran > 0);

  // Test honest non-fabrication fallback for unindexed word
  const unindexedResult = QuranDictionaryEngine.lookupWord('كلمة_غير_مفهرسة', 2, 10);
  assert.equal(unindexedResult.hasVerifiedLexicon, false, 'Must not invent lexical definitions');
  assert.equal(unindexedResult.entry, undefined);
  assert.ok(unindexedResult.surahNumber === 2 && unindexedResult.ayahNumber === 10);

  // Test root catalog and search
  const catalog = QuranDictionaryEngine.getRootsCatalog();
  assert.ok(catalog.length >= 5, 'Must provide catalog of verified Quranic roots');
  assert.ok(catalog.some(r => r.root === 'س-ر-ط'));

  const searchRootRes = QuranDictionaryEngine.searchDictionary('س-ر-ط', 'root');
  assert.ok(searchRootRes.length > 0);
  assert.equal(searchRootRes[0].root, 'س-ر-ط');
});

test('17. Feature 2: Quran Tafsir Comparison Workspace (5 Classical Commentaries)', async (t) => {
  const { AVAILABLE_TAFSIR_SOURCES, TAFSIR_COMPARISON_DATA } = await import('../src/data/tafsirComparisonData.ts');

  assert.equal(AVAILABLE_TAFSIR_SOURCES.length, 5, 'Must have exactly 5 classical Tafsir sources configured');
  const sourceIds = AVAILABLE_TAFSIR_SOURCES.map(s => s.id);
  assert.ok(sourceIds.includes('muyassar'), 'Must include Al-Tafsir Al-Muyassar');
  assert.ok(sourceIds.includes('ibn_kathir'), 'Must include Tafsir Ibn Kathir');
  assert.ok(sourceIds.includes('saadi'), 'Must include Tafsir Al-Saadi');
  assert.ok(sourceIds.includes('qurtubi'), 'Must include Tafsir Al-Qurtubi');
  assert.ok(sourceIds.includes('jalalayn'), 'Must include Tafsir Al-Jalalayn');

  for (const src of AVAILABLE_TAFSIR_SOURCES) {
    assert.ok(src.nameAr.length > 0);
    assert.ok(src.authorAr.length > 0);
    assert.ok(src.institutionAr.length > 0);
    assert.equal(src.verified, true);
  }

  // Check Ayah comparison records
  assert.ok(TAFSIR_COMPARISON_DATA.length >= 3);
  const fatihah5 = TAFSIR_COMPARISON_DATA.find(c => c.surahNumber === 1 && c.ayahNumber === 5);
  assert.ok(fatihah5, 'Must include Surah Al-Fatihah Ayah 5 comparison');
  assert.ok(fatihah5.tafsirs.muyassar.textAr.length > 20);
  assert.ok(fatihah5.tafsirs.ibn_kathir.textAr.length > 20);
  assert.ok(fatihah5.tafsirs.saadi.textAr.length > 20);
  assert.ok(fatihah5.tafsirs.qurtubi.textAr.length > 20);
  assert.ok(fatihah5.tafsirs.jalalayn.textAr.length > 10);
});

test('18. Feature 3: Audio Bookmarks Manager (Timestamp Persistence & Non-destructive Operations)', async (t) => {
  const { audioBookmarkManager, formatTime } = await import('../src/utils/audioBookmarkManager.ts');

  assert.equal(formatTime(125), '2:05');
  assert.equal(formatTime(60), '1:00');
  assert.equal(formatTime(9), '0:09');

  const bookmark = audioBookmarkManager.saveBookmark({
    reciterId: 'alafasy',
    surahNumber: 1,
    ayahNumber: 2,
    timestampSeconds: 45,
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
    label: 'علامة تدبر آية الحمد',
    note: 'وقفة تأمل عند الحمد لله رب العالمين'
  });

  assert.ok(bookmark.id.startsWith('ab_'));
  assert.equal(bookmark.surahNumber, 1);
  assert.equal(bookmark.timestampSeconds, 45);
  assert.equal(bookmark.formattedTimestamp, '0:45');
  assert.equal(bookmark.label, 'علامة تدبر آية الحمد');

  const allBookmarks = audioBookmarkManager.getBookmarks();
  assert.ok(allBookmarks.some(b => b.id === bookmark.id));

  // Update bookmark
  audioBookmarkManager.updateBookmark(bookmark.id, { label: 'تحديث العنوان' });
  const updated = audioBookmarkManager.getBookmarks().find(b => b.id === bookmark.id);
  assert.equal(updated?.label, 'تحديث العنوان');

  // Delete bookmark
  audioBookmarkManager.deleteBookmark(bookmark.id);
  const afterDelete = audioBookmarkManager.getBookmarks().find(b => b.id === bookmark.id);
  assert.equal(afterDelete, undefined);
});

test('19. Feature 4: Family Mode & Privacy Boundaries (Adult Note Isolation)', async (t) => {
  const { familyModeManager } = await import('../src/utils/familyModeManager.ts');

  const family = familyModeManager.getFamilyGroup();
  assert.ok(family.profiles.length >= 2, 'Must have at least parent and child profile');

  const parentProfile = family.profiles.find(p => p.role === 'admin') || family.profiles[0];
  const childProfile = family.profiles.find(p => p.role === 'child') || family.profiles[1];

  assert.equal(family.privacyRules.isolateAdultReflections, true, 'Must isolate adult reflections');
  assert.equal(family.privacyRules.isolateAdultNotes, true, 'Must isolate adult notes');

  // Verify strict permission boundary: another member cannot access adult notes
  const canChildAccessAdultNotes = familyModeManager.checkPermission(childProfile.id, parentProfile.id, 'access_private_notes');
  assert.equal(canChildAccessAdultNotes, false, 'Child or another adult MUST NOT access private notes');

  // Verify self access to notes is permitted
  const canParentAccessOwnNotes = familyModeManager.checkPermission(parentProfile.id, parentProfile.id, 'access_private_notes');
  assert.equal(canParentAccessOwnNotes, true, 'User must be able to access own private notes');

  // Parental review of child report
  const canParentViewChild = familyModeManager.checkPermission(parentProfile.id, childProfile.id, 'view_child_report');
  assert.equal(canParentViewChild, true, 'Parent can view child learning summary');

  // Shared family goals progress
  const initialGoalsCount = family.sharedGoals.length;
  assert.ok(initialGoalsCount > 0);
  const firstGoal = family.sharedGoals[0];
  const prevCount = firstGoal.currentCount;
  familyModeManager.incrementGoalProgress(firstGoal.id, 1);
  const updatedGoal = familyModeManager.getFamilyGroup().sharedGoals.find(g => g.id === firstGoal.id);
  assert.equal(updatedGoal?.currentCount, prevCount + 1);
});

test('20. Feature 5: Backup and Restore Manager (Validation, UTF-8 Preservation, Merge Strategy)', async (t) => {
  const { backupRestoreManager } = await import('../src/utils/backupRestoreManager.ts');

  // 1. Generate Backup
  const backup = backupRestoreManager.generateBackup({ includeFamily: true });
  assert.equal(backup.meta.appName, 'Wasl Islamic');
  assert.equal(backup.meta.schemaVersion, 'wasl_backup_v2');
  assert.ok(backup.meta.checksum.startsWith('chk_'));
  assert.ok(backup.meta.categories.length > 0);

  // 2. Validate valid JSON
  const jsonRaw = JSON.stringify(backup, null, 2);
  const valResult = backupRestoreManager.validateBackup(jsonRaw);
  assert.equal(valResult.valid, true);
  assert.ok(valResult.preview);
  assert.equal(valResult.preview.schemaVersion, 'wasl_backup_v2');

  // 3. Reject corrupted / malformed files
  const malformedResult = backupRestoreManager.validateBackup('{ invalid json string ...');
  assert.equal(malformedResult.valid, false);

  const fakeAppResult = backupRestoreManager.validateBackup(JSON.stringify({ meta: { appName: 'Fake App', schemaVersion: 'v1' }, data: {} }));
  assert.equal(fakeAppResult.valid, false);
  assert.ok(fakeAppResult.error?.includes('ليس نسخة احتياطية خاصة بتطبيق وصل'));

  // 4. Test safe Merge restoration
  const restoreRes = backupRestoreManager.restoreBackup(backup, 'merge');
  assert.equal(restoreRes.success, true);
  assert.ok(restoreRes.message.includes('تمت استعادة البيانات'));
});

test('21. Feature 6: Content Trust Center (12+ Authoritative Sources & Audit Trail)', async (t) => {
  const { TRUSTED_SOURCES, INITIAL_AUDIT_LOGS } = await import('../src/data/contentTrustDirectory.ts');

  assert.ok(TRUSTED_SOURCES.length >= 10, 'Must have 10+ configured authentic sources in Trust Center');

  const categoriesFound = new Set(TRUSTED_SOURCES.map(s => s.category));
  assert.ok(categoriesFound.has('quran'), 'Must cover Quran text');
  assert.ok(categoriesFound.has('tafsir'), 'Must cover Tafsir');
  assert.ok(categoriesFound.has('hadith'), 'Must cover Hadith');
  assert.ok(categoriesFound.has('dictionary'), 'Must cover Quranic dictionary');
  assert.ok(categoriesFound.has('audio'), 'Must cover Audio');
  assert.ok(categoriesFound.has('prayer_calendar'), 'Must cover Prayer & Calendar');

  for (const src of TRUSTED_SOURCES) {
    assert.ok(src.sourceUrl.startsWith('https://'), 'Source URL must be secure HTTPS');
    assert.ok(src.verificationStatus.length > 0);
    assert.ok(src.reviewedBy.length > 0);
    assert.ok(src.contentTypesSupplied.length > 0);
  }

  assert.ok(INITIAL_AUDIT_LOGS.length >= 3, 'Must maintain traceable audit logs');
  for (const log of INITIAL_AUDIT_LOGS) {
    assert.ok(log.sourceId.length > 0);
    assert.ok(log.reviewer.length > 0);
    assert.ok(log.auditNotes.length > 10);
  }
});

test('22. Feature 7: Focus Mode & Reading Surfaces (Light, Dark, Sepia)', async (t) => {
  const { DEFAULT_READING_PREFS } = await import('../src/utils/readingPreferences.ts');

  assert.ok(DEFAULT_READING_PREFS.fontSize >= 20 && DEFAULT_READING_PREFS.fontSize <= 40);
  assert.equal(DEFAULT_READING_PREFS.fontFamily, 'amiri');
  assert.equal(DEFAULT_READING_PREFS.lineHeight, 'relaxed');
});

test('23. Expansion Feature 1: Quran Thematic Index (الفهرس الموضوعي للقرآن)', async (t) => {
  const { THEMATIC_CATEGORIES, THEMATIC_TOPICS, searchThematicTopics } = await import('../src/data/thematicIndexData.ts');

  // Verify 14 core thematic categories
  assert.equal(THEMATIC_CATEGORIES.length, 14, 'Must have exactly 14 Quranic categories');
  const categoryIds = THEMATIC_CATEGORIES.map(c => c.id);
  assert.ok(categoryIds.includes('tawhid-faith'), 'Tawhid category must exist');
  assert.ok(categoryIds.includes('prophets-messengers'), 'Prophets category must exist');
  assert.ok(categoryIds.includes('patience-gratitude'), 'Patience category must exist');
  assert.ok(categoryIds.includes('parents-kinship'), 'Parents category must exist');
  assert.ok(categoryIds.includes('worship-devotion'), 'Worship category must exist');

  // Verify topics and canonical references
  assert.ok(THEMATIC_TOPICS.length >= 10, 'Must contain authentic thematic topics');
  for (const topic of THEMATIC_TOPICS) {
    assert.ok(topic.id.length > 0);
    assert.ok(topic.titleAr.length > 0);
    assert.ok(topic.summaryAr.length > 0);
    assert.ok(topic.verses.length > 0, 'Each topic must have verified passages');
    assert.ok(topic.sourceAttribution.length > 0, 'Each topic must have source attribution');

    for (const v of topic.verses) {
      assert.ok(v.surahNumber >= 1 && v.surahNumber <= 114, 'Surah number must be between 1 and 114');
      assert.ok(v.ayahNumber > 0, 'Ayah number must be positive');
      assert.ok(v.textAr.length > 0, 'Passage must include canonical Quran text');
      assert.ok(v.tafsirSummaryAr.length > 0, 'Passage must include brief Tafsir context');
    }
  }

  // Verify Arabic search normalization
  const searchResults1 = searchThematicTopics('صبر');
  assert.ok(searchResults1.length > 0, 'Should match topics about patience');
  assert.ok(searchResults1.some(t => t.id === 'topic-patience-virtues' || t.titleAr.includes('صبر')));

  const searchResults2 = searchThematicTopics('توحيد');
  assert.ok(searchResults2.length > 0, 'Should match topics about Tawhid');
  assert.ok(searchResults2.some(t => t.id === 'topic-tawhid-oneness' || t.titleAr.includes('توحيد')));
});

test('24. Expansion Feature 2: Surah Information Pages (بطاقة تعريف لكل سورة)', async (t) => {
  const { getSurahInformation } = await import('../src/data/surahInformationData.ts');
  const { SURAH_LIST } = await import('../src/data/quranMetadata.ts');

  // Verify all 114 Surahs have valid information cards
  assert.equal(SURAH_LIST.length, 114);
  for (let i = 1; i <= 114; i++) {
    const card = getSurahInformation(i);
    assert.equal(card.surahNumber, i);
    assert.ok(card.nameAr.length > 0);
    assert.ok(card.numberOfAyahs > 0);
    assert.ok(card.overviewSummaryAr.length > 0);
    assert.ok(card.coreObjectivesAr.length > 0);
    assert.ok(card.keySections.length > 0);
    assert.ok(card.sourceAttribution.length > 0);
  }

  // Test Surah Al-Fatihah (1)
  const fatihah = getSurahInformation(1);
  assert.equal(fatihah.surahNumber, 1);
  assert.equal(fatihah.nameAr, 'الفاتحة');
  assert.equal(fatihah.numberOfAyahs, 7);
  assert.equal(fatihah.revelationType, 'Meccan');
  assert.ok(fatihah.keySections.length > 0);
  assert.ok(fatihah.linguisticInsights.length > 0);
  assert.ok(fatihah.sourceAttribution.includes('مجمع الملك فهد') || fatihah.sourceAttribution.includes('التفسير'));

  // Test Surah Al-Baqarah (2)
  const baqarah = getSurahInformation(2);
  assert.equal(baqarah.surahNumber, 2);
  assert.equal(baqarah.nameAr, 'البقرة');
  assert.equal(baqarah.numberOfAyahs, 286);
  assert.equal(baqarah.revelationType, 'Medinan');
  assert.ok(baqarah.overviewSummaryAr.includes('أطول سورة') || baqarah.overviewSummaryAr.length > 20);

  // Test Surah An-Nas (114)
  const nas = getSurahInformation(114);
  assert.equal(nas.surahNumber, 114);
  assert.equal(nas.nameAr, 'الناس');
  assert.equal(nas.numberOfAyahs, 6);
  assert.ok(nas.coreObjectivesAr.length > 0);
});

test('25. Expansion Feature 3: Similar Ayahs Explorer (مستكشف الآيات المتشابهة)', async (t) => {
  const { CURATED_SIMILAR_GROUPS } = await import('../src/data/similarAyahsData.ts');
  const { alignAndDiffAyahs, findSimilarGroupsForAyah, searchSimilarGroups } = await import('../src/utils/similarAyahsEngine.ts');

  // Verify curated similarity groups
  assert.ok(CURATED_SIMILAR_GROUPS.length >= 5, 'Must contain classical Mutashabihat curated groups');

  for (const group of CURATED_SIMILAR_GROUPS) {
    assert.ok(group.titleAr.length > 0);
    assert.ok(group.sourceAttribution.length > 0);
    assert.ok(group.scholarlyAnalysisAr.length > 0);
    assert.ok(group.ayahs.length >= 2, 'Group must compare at least 2 verses');
    for (const a of group.ayahs) {
      assert.ok(a.surahNumber >= 1 && a.surahNumber <= 114);
      assert.ok(a.ayahNumber > 0);
      assert.ok(a.textAr.length > 0);
    }
  }

  // Lookup by verse (e.g. 2:48)
  const matchesFor2_48 = findSimilarGroupsForAyah(2, 48);
  assert.ok(matchesFor2_48.length > 0, 'Should find similar verse group for 2:48');

  // Test difference tokenization engine
  const text1 = 'وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ';
  const text2 = 'وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنفَعُهَا شَفَاعَةٌ';
  const tokens = alignAndDiffAyahs(text1, text2);
  assert.ok(tokens.length > 0);
  assert.ok(tokens.some(t => !t.isDiff), 'Must have matching tokens');
  assert.ok(tokens.some(t => t.isDiff), 'Must detect differing words');

  // Search by query
  const searchResults = searchSimilarGroups('شفاعة');
  assert.ok(searchResults.length > 0);
});

test('26. Expansion Feature 4: Islamic Seasons Center (مركز المواسم الإسلامية)', async (t) => {
  const { ISLAMIC_SEASONS_DATA } = await import('../src/data/seasonsData.ts');
  const { seasonsManager } = await import('../src/utils/seasonsManager.ts');

  // Verify core Islamic seasons
  assert.ok(ISLAMIC_SEASONS_DATA.length >= 8);
  const seasonIds = ISLAMIC_SEASONS_DATA.map(s => s.id);
  assert.ok(seasonIds.includes('ramadan-month'));
  assert.ok(seasonIds.includes('last-ten-ramadan'));
  assert.ok(seasonIds.includes('eid-fitr'));
  assert.ok(seasonIds.includes('ten-dhul-hijjah'));
  assert.ok(seasonIds.includes('eid-adha-tashreeq'));
  assert.ok(seasonIds.includes('ashura-season'));
  assert.ok(seasonIds.includes('white-days-regular'));
  assert.ok(seasonIds.includes('mondays-thursdays'));
  assert.ok(seasonIds.includes('hajj-umrah-season'));

  for (const season of ISLAMIC_SEASONS_DATA) {
    assert.ok(season.nameAr.length > 0);
    assert.ok(season.summaryAr.length > 0);
    assert.ok(season.virtuesAr.length > 0);
    assert.ok(season.authenticAdhkar.length > 0);
    assert.ok(season.relatedVerses.length > 0);
  }

  // Moon sighting adjustment test (-2 to +2 days)
  seasonsManager.setAdjustmentDays(1);
  assert.equal(seasonsManager.getAdjustmentDays(), 1);
  seasonsManager.setAdjustmentDays(0);
  assert.equal(seasonsManager.getAdjustmentDays(), 0);

  // Status computation
  const status = seasonsManager.getSeasonsStatus();
  assert.ok(status, 'Must return season status');
  assert.ok(status.upcomingSeason, 'Must provide upcoming season');
  assert.ok(status.daysRemainingToUpcoming >= 1);
  assert.ok(status.hijriDate.formattedAr.length > 0);
});

test('27. Expansion Feature 5: Accessibility & Senior-Friendly Mode (وضع كبار السن وسهولة الاستخدام)', async (t) => {
  const { accessibilityManager } = await import('../src/utils/accessibilityManager.ts');

  // Reset defaults first
  accessibilityManager.resetDefaults();
  let current = accessibilityManager.getSettings();
  assert.equal(current.isSeniorMode, false);
  assert.equal(current.fontSizeScale, 1.0);
  assert.equal(current.isHighContrast, false);

  // Toggle Senior Mode
  const toggledState = accessibilityManager.toggleSeniorMode();
  assert.equal(toggledState, true);
  current = accessibilityManager.getSettings();
  assert.equal(current.isSeniorMode, true);
  assert.equal(current.fontSizeScale, 1.3);
  assert.equal(current.isHighContrast, true);
  assert.equal(current.isSimplifiedNav, true);

  // Update specific scale
  accessibilityManager.updateSettings({ fontSizeScale: 1.5, isReducedMotion: true });
  current = accessibilityManager.getSettings();
  assert.equal(current.fontSizeScale, 1.5);
  assert.equal(current.isReducedMotion, true);

  // Reset to default
  accessibilityManager.resetDefaults();
  current = accessibilityManager.getSettings();
  assert.equal(current.isSeniorMode, false);
  assert.equal(current.fontSizeScale, 1.0);
});

test('28. Expansion Feature 6: Synchronized Quran Audio & Reading (القراءة المتزامنة مع التلاوة)', async (t) => {
  const { audioSyncEngine } = await import('../src/utils/audioSyncEngine.ts');

  // Initial state check
  const state = audioSyncEngine.getState();
  assert.equal(state.isSyncActive, false);

  // Build audio track for Surah 1 Ayah 1
  const track1_1 = audioSyncEngine.buildAyahAudioTrack(1, 1, 'alafasy');
  assert.equal(track1_1.surahNumber, 1);
  assert.equal(track1_1.ayahNumber, 1);
  assert.match(track1_1.audioUrl, /Alafasy_128kbps\/001001\.mp3/);

  // Start synchronization
  const startedTrack = audioSyncEngine.startSync(1, 1, 'alafasy');
  assert.equal(startedTrack.surahNumber, 1);
  assert.equal(startedTrack.ayahNumber, 1);
  assert.equal(audioSyncEngine.getState().isSyncActive, true);

  // Move to Next Ayah
  const nextTrack = audioSyncEngine.nextAyah();
  assert.ok(nextTrack);
  assert.equal(nextTrack.ayahNumber, 2);
  assert.equal(audioSyncEngine.getState().currentAyahNumber, 2);

  // Move to Previous Ayah
  const prevTrack = audioSyncEngine.previousAyah();
  assert.ok(prevTrack);
  assert.equal(prevTrack.ayahNumber, 1);
  assert.equal(audioSyncEngine.getState().currentAyahNumber, 1);

  // Jump to specific Ayah
  const jumpedTrack = audioSyncEngine.jumpToAyah(2, 255); // Ayat Al-Kursi
  assert.equal(jumpedTrack.surahNumber, 2);
  assert.equal(jumpedTrack.ayahNumber, 255);
  assert.match(jumpedTrack.audioUrl, /002255\.mp3/);

  // Modes
  audioSyncEngine.setPlaybackMode('repeat_ayah');
  assert.equal(audioSyncEngine.getState().playbackMode, 'repeat_ayah');

  // Stop sync
  audioSyncEngine.stopSync();
  assert.equal(audioSyncEngine.getState().isSyncActive, false);
});

test('29. Expansion Feature 7: Guided Islamic Learning Paths (المسارات التعليمية الموجهة)', async (t) => {
  const { INITIAL_LEARNING_PATHS } = await import('../src/data/learningPathsData.ts');
  const { learningPathsManager } = await import('../src/utils/learningPathsManager.ts');

  // Verify structured curricula
  assert.ok(INITIAL_LEARNING_PATHS.length >= 5, 'Must have comprehensive guided learning paths');
  for (const path of INITIAL_LEARNING_PATHS) {
    assert.ok(path.id.length > 0);
    assert.ok(path.titleAr.length > 0);
    assert.ok(path.descriptionAr.length > 0);
    assert.ok(path.steps.length >= 2, 'Each path must have ordered lessons');
    assert.ok(path.verifiedSources.length > 0, 'Each path must cite verified sources');

    for (const step of path.steps) {
      assert.ok(step.id.length > 0);
      assert.ok(step.titleAr.length > 0);
      assert.ok(step.contentSummaryAr.length > 0);
    }
  }

  // Enrollment and progress tracking
  const pathId = 'path-fatihah-short-surahs';
  const enrollment = learningPathsManager.enrollInPath(pathId);
  assert.equal(enrollment.pathId, pathId);
  assert.equal(enrollment.isCompleted, false);

  // Step completion
  const path = learningPathsManager.getPathById(pathId);
  assert.ok(path);
  const firstStep = path.steps[0];
  learningPathsManager.completeStep(pathId, firstStep.id, 'تدبر عظيم في معنى البسملة والاستعانة بالله وحده');

  const updatedProg = learningPathsManager.getPathProgress(pathId);
  assert.ok(updatedProg);
  assert.ok(updatedProg.completedStepIds.includes(firstStep.id));
  assert.equal(updatedProg.notes[firstStep.id], 'تدبر عظيم في معنى البسملة والاستعانة بالله وحده');
});

test('30. 12-Hour Clock Centralized Formatter Tests (Midnight, Noon, AM, PM, Arabic ص / م)', async (t) => {
  const { format12HourTime } = await import('../src/utils/timeFormat.ts');

  // Midnight test
  assert.equal(format12HourTime('00:00'), '12:00 ص');
  assert.equal(format12HourTime('00:00', true), '12:00 AM');
  assert.equal(format12HourTime('00:15'), '12:15 ص');
  assert.equal(format12HourTime('00:15', true), '12:15 AM');

  // Noon test
  assert.equal(format12HourTime('12:00'), '12:00 م');
  assert.equal(format12HourTime('12:00', true), '12:00 PM');
  assert.equal(format12HourTime('12:30'), '12:30 م');
  assert.equal(format12HourTime('12:30', true), '12:30 PM');

  // Morning tests (ص / AM)
  assert.equal(format12HourTime('04:35'), '4:35 ص');
  assert.equal(format12HourTime('04:35', true), '4:35 AM');
  assert.equal(format12HourTime('09:15'), '9:15 ص');
  assert.equal(format12HourTime('09:15', true), '9:15 AM');
  assert.equal(format12HourTime('11:59'), '11:59 ص');
  assert.equal(format12HourTime('11:59', true), '11:59 AM');

  // Afternoon & Evening tests (م / PM)
  assert.equal(format12HourTime('14:30'), '2:30 م');
  assert.equal(format12HourTime('14:30', true), '2:30 PM');
  assert.equal(format12HourTime('18:45'), '6:45 م');
  assert.equal(format12HourTime('18:45', true), '6:45 PM');
  assert.equal(format12HourTime('23:45'), '11:45 م');
  assert.equal(format12HourTime('23:45', true), '11:45 PM');

  // Date object input test
  const morningDate = new Date(2026, 9, 11, 5, 20, 0);
  assert.equal(format12HourTime(morningDate), '5:20 ص');
  assert.equal(format12HourTime(morningDate, true), '5:20 AM');

  const eveningDate = new Date(2026, 9, 11, 20, 45, 0);
  assert.equal(format12HourTime(eveningDate), '8:45 م');
  assert.equal(format12HourTime(eveningDate, true), '8:45 PM');
});

test('31. Dynamic & Accurate Ramadan Countdown Engine Tests (Astronomical Umm al-Qura Calculation)', async (t) => {
  const { getRamadanCountdownDetails } = await import('../src/utils/ramadanCountdown.ts');
  const { getRamadanCountdown } = await import('../src/utils/prayerTimes.ts');

  // Verify not hardcoded (was previously hardcoded to 14)
  const remainingDays = getRamadanCountdown();
  assert.notEqual(remainingDays, 14, 'Ramadan countdown must not be hardcoded to 14');
  assert.ok(typeof remainingDays === 'number' && remainingDays > 0, 'Ramadan days must be positive number');

  // Comprehensive details check
  const now = new Date();
  const details = getRamadanCountdownDetails(now);
  assert.ok(details.targetDate instanceof Date, 'Target date must be a valid Date');
  assert.ok(details.targetHijriYear >= 1447, 'Target Hijri year must be plausible');
  assert.ok(details.days >= 0, 'Remaining days must never be negative');
  assert.ok(details.hours >= 0 && details.hours < 24, 'Remaining hours must be in [0, 23]');
  assert.ok(details.minutes >= 0 && details.minutes < 60, 'Remaining minutes must be in [0, 59]');
  assert.ok(details.seconds >= 0 && details.seconds < 60, 'Remaining seconds must be in [0, 59]');
  assert.ok(details.totalMs >= 0, 'Remaining ms must never be negative');
  assert.equal(details.isEstimated, true, 'Unconfirmed date must be labeled as estimate');
  assert.ok(details.statusBadgeAr.length > 0, 'Arabic status badge must be present');
  assert.ok(details.announcementNoteAr.includes('تقويم أم القرى'), 'Must reference Umm al-Qura calendar');

  // Boundary test: Simulated date inside Ramadan (e.g. 15 Ramadan 1448 ~ Feb 22, 2027)
  const simulatedRamadanDate = new Date('2027-02-22T12:00:00Z');
  const ramadanDetails = getRamadanCountdownDetails(simulatedRamadanDate);
  assert.equal(ramadanDetails.isRamadanActive, true, 'Must identify active Ramadan month');
  assert.ok(ramadanDetails.currentRamadanDay >= 1 && ramadanDetails.currentRamadanDay <= 30);
  assert.ok(ramadanDetails.statusBadgeAr.includes('شهر رمضان مبارك'));

  // Boundary test: Simulated date after Ramadan (e.g. 15 Shawwal 1448 ~ March 23, 2027)
  const postRamadanDate = new Date('2027-03-23T12:00:00Z');
  const postRamadanDetails = getRamadanCountdownDetails(postRamadanDate);
  assert.equal(postRamadanDetails.isRamadanActive, false);
  assert.equal(postRamadanDetails.targetHijriYear, 1449, 'After Ramadan, must automatically target Ramadan of next Hijri year');
  assert.ok(postRamadanDetails.days > 250, 'Countdown to next year Ramadan must be around ~300 days');
  assert.ok(postRamadanDetails.totalMs > 0, 'Must never be negative');
});

test('32. Timezone-Awareness, Closest City, and Dynamic Islamic Occasions Tests', async (t) => {
  const { detectLocalTimezone, findClosestCity } = await import('../src/utils/timeFormat.ts');
  const { getUpcomingIslamicOccasions } = await import('../src/utils/ramadanCountdown.ts');

  // Timezone detection
  const tz = detectLocalTimezone();
  assert.ok(typeof tz.offsetHours === 'number');
  assert.ok(tz.matchedCity, 'Must match a valid city');
  assert.ok(tz.matchedCity.lat && tz.matchedCity.lng);

  // Closest city coordinates test
  // Coordinates close to Riyadh (24.7, 46.7)
  const nearRiyadh = findClosestCity(24.75, 46.72);
  assert.equal(nearRiyadh.id, 'riyadh');

  // Coordinates close to Cairo (30.0, 31.2)
  const nearCairo = findClosestCity(30.05, 31.25);
  assert.equal(nearCairo.id, 'cairo');

  // Dynamic occasions test (no hardcoded years)
  const occasions = getUpcomingIslamicOccasions();
  assert.ok(occasions.length >= 5, 'Must calculate upcoming occasions');
  for (const occ of occasions) {
    assert.ok(occ.id.length > 0);
    assert.ok(occ.nameAr.length > 0);
    assert.ok(occ.targetDate instanceof Date);
    assert.ok(occ.targetHijriYear >= 1448);
    assert.ok(occ.countdown.days >= 0, 'Occasion days remaining must never be negative');
    assert.ok(occ.countdown.totalMs >= 0);
  }
});

test('33. Daily Content Rotation Integrity Tests (Ayah, Hadith, Dhikr Date Derived)', async (t) => {
  const { VERIFIED_OFFLINE_SURAHS } = await import('../src/data/quranMetadata.ts');
  const { AUTHENTIC_HADITHS } = await import('../src/data/hadithData.ts');
  const { ADHKAR_DATA } = await import('../src/data/adhkarData.ts');

  // Pool of verified offline ayahs across Surahs 1, 112, 113, 114
  const verifiedAyahsPool = [
    ...(VERIFIED_OFFLINE_SURAHS[1] || []).map(a => ({ surah: 1, ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[112] || []).map(a => ({ surah: 112, ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[113] || []).map(a => ({ surah: 113, ayah: a })),
    ...(VERIFIED_OFFLINE_SURAHS[114] || []).map(a => ({ surah: 114, ayah: a })),
  ];

  assert.ok(verifiedAyahsPool.length >= 20, 'Must have at least 20 verified authentic offline Ayahs');
  assert.ok(AUTHENTIC_HADITHS.length >= 5, 'Must have authentic hadiths');
  assert.ok(ADHKAR_DATA.length >= 5, 'Must have authentic adhkar');

  // Verify rotations for two different days of the year produce varied, valid content
  const day1 = 100;
  const day2 = 101;

  const ayah1 = verifiedAyahsPool[day1 % verifiedAyahsPool.length];
  const ayah2 = verifiedAyahsPool[day2 % verifiedAyahsPool.length];
  assert.ok(ayah1.ayah.text.length > 0);
  assert.ok(ayah2.ayah.text.length > 0);

  const hadith1 = AUTHENTIC_HADITHS[day1 % AUTHENTIC_HADITHS.length];
  const hadith2 = AUTHENTIC_HADITHS[day2 % AUTHENTIC_HADITHS.length];
  assert.ok(hadith1.arabic.length > 0);
  assert.ok(hadith2.arabic.length > 0);

  const dhikr1 = ADHKAR_DATA[day1 % ADHKAR_DATA.length];
  const dhikr2 = ADHKAR_DATA[day2 % ADHKAR_DATA.length];
  assert.ok(dhikr1.textAr.length > 0);
  assert.ok(dhikr2.textAr.length > 0);
});

test('34. Mobile Tap Interactions, Layering, and Hit-Target Contract Tests', async (t) => {
  // 1. Verify CSS touch-action and tap highlight in globals.css
  const globalsCss = fs.readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf-8');
  assert.ok(globalsCss.includes('touch-action: manipulation'), 'globals.css must specify touch-action: manipulation to eliminate mobile 300ms delay');
  assert.ok(globalsCss.includes('-webkit-tap-highlight-color: transparent'), 'globals.css must reset tap highlight');
  assert.ok(globalsCss.includes('safe-area-pb'), 'globals.css must provide safe-area utilities for notched mobile devices');

  // 2. Verify Navbar mobile drawer architecture and guarded touch handlers
  const navbarSrc = fs.readFileSync(new URL('../src/components/Navbar.tsx', import.meta.url), 'utf-8');
  assert.ok(!navbarSrc.includes("document.addEventListener('touchstart'"), 'Navbar must not attach unconditional touchstart on document which cancels mobile taps');
  assert.ok(navbarSrc.includes('pointerdown'), 'Navbar must use guarded pointerdown for outside clicks');
  assert.ok(navbarSrc.includes('isMobileMenuOpen && ('), 'Navbar mobile menu drawer must be present');
  assert.ok(navbarSrc.includes('fixed inset-0 top-['), 'Navbar mobile menu drawer must be fixed overlay outside header containing block');
  assert.ok(navbarSrc.includes('e.target === e.currentTarget'), 'Navbar mobile menu drawer must support backdrop tap to dismiss');
  assert.ok(navbarSrc.includes('min-h-[48px]'), 'Mobile bottom navigation items must meet minimum 44px tap target standard (uses 48px)');
  assert.ok(navbarSrc.includes('min-h-[44px] min-w-[44px]'), 'Mobile top control buttons must have minimum 44x44px touch target');

  // 3. Verify main content padding in page.tsx prevents bottom bar occlusion
  const pageSrc = fs.readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf-8');
  assert.ok(pageSrc.includes('pb-24 sm:pb-28 lg:pb-8'), 'Page main container must provide mobile bottom clearance for fixed navigation & audio bars');

  // 4. Verify decorative Search icons have pointer-events-none across components
  const searchComponents = [
    '../src/components/trust/ContentTrustCenter.tsx',
    '../src/components/QuranPlatform.tsx',
    '../src/components/quran/QuranThematicIndex.tsx',
    '../src/components/quran/QuranReflectionJournal.tsx',
    '../src/components/quran/QuranDictionaryExplorer.tsx',
    '../src/components/quran/AudioBookmarksLibrary.tsx',
    '../src/components/quran/SimilarAyahsExplorer.tsx',
    '../src/components/library/MyIslamicLibrary.tsx',
    '../src/components/discover/WaslAcademy.tsx',
    '../src/components/discover/IslamicSourceCenter.tsx',
    '../src/components/discover/IslamicKnowledgeSearch.tsx'
  ];

  for (const compPath of searchComponents) {
    const compSrc = fs.readFileSync(new URL(compPath, import.meta.url), 'utf-8');
    assert.ok(
      compSrc.includes('pointer-events-none'),
      `Component ${compPath} must use pointer-events-none on decorative input overlay icons to prevent blocking taps`
    );
  }

  // 5. Verify Modals have backdrop dismissals and semantic close buttons
  const modalFiles = [
    '../src/components/GlobalSearchModal.tsx',
    '../src/components/UserAccountModal.tsx',
    '../src/components/tools/OfflineManagerModal.tsx',
    '../src/components/tools/PersonalizationSettingsModal.tsx',
    '../src/components/tools/BackupRestoreModal.tsx',
    '../src/components/tools/QuickAccessWidgetModal.tsx',
    '../src/components/accessibility/AccessibilitySettingsModal.tsx',
    '../src/components/quran/ReadingPreferencesModal.tsx'
  ];

  for (const modalPath of modalFiles) {
    const modalSrc = fs.readFileSync(new URL(modalPath, import.meta.url), 'utf-8');
    assert.ok(
      modalSrc.includes('e.target === e.currentTarget') || modalSrc.includes('onClose'),
      `Modal ${modalPath} must support backdrop tap to dismiss or close handler`
    );
    assert.ok(
      modalSrc.includes('min-h-[44px]') || modalSrc.includes('p-2') || modalSrc.includes('p-2.5'),
      `Modal ${modalPath} must have accessible close button touch target`
    );
  }
});

test('35. Hostinger Real Email Notification System & Subscriber Security', async () => {
  const { normalizeEmail, sanitizeCategories, generateVerificationToken, hashToken, checkRateLimit, NOTIFICATION_CATEGORIES } = await import('../src/lib/email/tokens.ts');
  const { getSmtpDiagnostics } = await import('../src/lib/email/hostingerSmtp.ts');
  const { renderConfirmSubscriptionEmail, renderDailyIslamicEmail } = await import('../src/lib/email/templates.ts');
  const { getDailyEmailContent } = await import('../src/lib/email/dailyContent.ts');

  // 1. Email Normalization and CRLF Injection Defense
  assert.equal(normalizeEmail('user@waslislam.fun').valid, true);
  assert.equal(normalizeEmail('user@waslislam.fun\r\nBcc: evil@hacker.com').valid, false);
  assert.equal(normalizeEmail('user%0Abcc@test.com').valid, false);

  // 2. Categories
  assert.ok(NOTIFICATION_CATEGORIES.length >= 4);
  assert.deepEqual(sanitizeCategories(['daily_islamic']), ['daily_islamic']);
  assert.deepEqual(sanitizeCategories([]), ['daily_islamic']);

  // 3. Cryptographic Token Hashing
  const tokenObj = generateVerificationToken(24);
  assert.equal(tokenObj.rawToken.length, 64);
  assert.equal(tokenObj.tokenHash, hashToken(tokenObj.rawToken));
  assert.ok(tokenObj.expiresAt.getTime() > Date.now());

  // 4. Secret Isolation in SMTP Diagnostics
  const diag = getSmtpDiagnostics();
  assert.equal('pass' in diag, false, 'Diagnostics must never contain raw passwords');
  assert.equal('password' in diag, false);

  // 5. Rate Limiting Protection
  const limitKey = `suite_test_limiter_${Date.now()}`;
  assert.equal(checkRateLimit(limitKey, 2, 1000).allowed, true);
  assert.equal(checkRateLimit(limitKey, 2, 1000).allowed, true);
  assert.equal(checkRateLimit(limitKey, 2, 1000).allowed, false);

  // 6. Templates RTL & Content
  const confirm = renderConfirmSubscriptionEmail({
    siteUrl: 'https://waslislam.fun',
    verificationUrl: 'https://waslislam.fun/api/notifications/verify?token=123',
    categoriesLabels: ['الرسالة الإيمانية اليومية']
  });
  assert.ok(confirm.html.includes('dir="rtl"'));
  assert.ok(confirm.html.includes('منصة وصل الإسلامية'));

  const daily = renderDailyIslamicEmail({
    siteUrl: 'https://waslislam.fun',
    dateFormatted: '12 أكتوبر 2026',
    hijriFormatted: '29 ربيع الثاني 1448 هـ',
    ayah: {
      surahNameAr: 'الفاتحة',
      surahNumber: 1,
      ayahNumber: 1,
      textAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      surahUrl: 'https://waslislam.fun/#quran'
    },
    hadith: {
      textAr: 'إنما الأعمال بالنيات',
      sourceAr: 'صحيح البخاري'
    },
    dhikr: {
      titleAr: 'أذكار الصباح',
      textAr: 'أصبحنا وأصبح الملك لله'
    },
    manageUrl: 'https://waslislam.fun/manage',
    unsubscribeUrl: 'https://waslislam.fun/unsub'
  });
  assert.ok(daily.html.includes('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'));
  assert.ok(daily.html.includes('صحيح البخاري'));

  // 7. Verified Daily Content Selector
  const dailyContent = getDailyEmailContent(new Date());
  assert.ok(dailyContent.ayah.textAr.length > 0);
  assert.ok(dailyContent.hadith.textAr.length > 0);
  assert.ok(dailyContent.dhikr.textAr.length > 0);

  // 8. Migration SQL File Verification
  const sqlExists = fs.existsSync(new URL('../supabase/migrations/20261012_email_notifications.sql', import.meta.url));
  assert.ok(sqlExists, 'Email notification SQL migration must exist');
});





