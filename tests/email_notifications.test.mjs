import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeEmail,
  sanitizeCategories,
  generateVerificationToken,
  hashToken,
  generateSecureToken,
  checkRateLimit,
  generateOtpCode,
  normalizeOtpInput,
  hashOtp,
  verifyOtpHash,
  OTP_CONFIG,
  NOTIFICATION_CATEGORIES,
  VALID_CATEGORY_IDS
} from '../src/lib/email/tokens.ts';

import {
  getSmtpConfig,
  getSmtpDiagnostics,
  sendHostingerEmail
} from '../src/lib/email/hostingerSmtp.ts';

import {
  renderConfirmSubscriptionEmail,
  renderDailyIslamicEmail,
  renderPreferencesUpdatedEmail,
  renderUnsubscribeConfirmationEmail,
  renderAdminAlertEmail
} from '../src/lib/email/templates.ts';

import { getDailyEmailContent } from '../src/lib/email/dailyContent.ts';

// --------------------------------------------------------------------------
// 1. Email Address Validation & Normalization
// --------------------------------------------------------------------------
test('1. Email Address Validation & CRLF Injection Prevention', () => {
  // Valid email addresses
  const valid1 = normalizeEmail('test@example.com');
  assert.equal(valid1.valid, true);
  assert.equal(valid1.email, 'test@example.com');

  const validUppercase = normalizeEmail('USER.NAME+tag@WASLISLAM.FUN  ');
  assert.equal(validUppercase.valid, true);
  assert.equal(validUppercase.email, 'user.name+tag@waslislam.fun');

  // Header injection attempts (CRLF)
  const injection1 = normalizeEmail('victim@example.com\r\nBcc: hacker@bad.com');
  assert.equal(injection1.valid, false, 'Must reject CRLF injection attempts');

  const injection2 = normalizeEmail('victim@example.com%0ABcc: hacker@bad.com');
  assert.equal(injection2.valid, false, 'Must reject percent-encoded newlines');

  const injection3 = normalizeEmail('victim<script>@example.com');
  assert.equal(injection3.valid, false, 'Must reject HTML/script tags');

  // Invalid formats
  assert.equal(normalizeEmail('not-an-email').valid, false);
  assert.equal(normalizeEmail('@missinguser.com').valid, false);
  assert.equal(normalizeEmail('missingdomain@').valid, false);
  assert.equal(normalizeEmail(null).valid, false);
  assert.equal(normalizeEmail(undefined).valid, false);
  assert.equal(normalizeEmail('').valid, false);
});

// --------------------------------------------------------------------------
// 2. Notification Categories Validation & Defaults
// --------------------------------------------------------------------------
test('2. Notification Categories Sanitization', () => {
  assert.ok(NOTIFICATION_CATEGORIES.length >= 4, 'Must have at least 4 verified categories');
  assert.ok(VALID_CATEGORY_IDS.has('daily_islamic'));
  assert.ok(VALID_CATEGORY_IDS.has('worship_reminders'));
  assert.ok(VALID_CATEGORY_IDS.has('seasonal_updates'));
  assert.ok(VALID_CATEGORY_IDS.has('educational_content'));

  // Default fallback when non-array or empty
  assert.deepEqual(sanitizeCategories(null), ['daily_islamic']);
  assert.deepEqual(sanitizeCategories([]), ['daily_islamic']);
  assert.deepEqual(sanitizeCategories(['invalid_cat', 'fake']), ['daily_islamic']);

  // Valid selection
  const validSelection = sanitizeCategories(['daily_islamic', 'seasonal_updates']);
  assert.deepEqual(validSelection, ['daily_islamic', 'seasonal_updates']);
});

// --------------------------------------------------------------------------
// 3. OTP Generation, Normalization, and HMAC Security
// --------------------------------------------------------------------------
test('3. OTP Generation, Normalization, and HMAC Security', () => {
  // Test generating multiple OTP codes
  for (let i = 0; i < 50; i++) {
    const code = generateOtpCode();
    assert.equal(code.length, 6, 'OTP must be exactly 6 digits');
    assert.match(code, /^\d{6}$/, 'OTP must be strictly numeric');
  }

  // Normalization: Arabic-Indic numerals
  assert.equal(normalizeOtpInput('١٢٣٤٥٦'), '123456');
  // Normalization: Persian numerals
  assert.equal(normalizeOtpInput('۱۲۳۴۵۶'), '123456');
  // Mixed with spaces/hyphens
  assert.equal(normalizeOtpInput(' 12-34 56 '), '123456');
  // Non-digits stripped
  assert.equal(normalizeOtpInput('a1b2c3d4e5f6g'), '123456');
  // Empty
  assert.equal(normalizeOtpInput(''), '');

  // HMAC generation and email-binding
  const emailA = 'user.a@example.com';
  const emailB = 'user.b@example.com';
  const otp = '048291';

  const hashA = hashOtp(emailA, otp);
  const hashB = hashOtp(emailB, otp);

  assert.equal(typeof hashA, 'string');
  assert.equal(hashA.length, 64, 'HMAC-SHA256 must be 64 hex characters');
  assert.notEqual(hashA, hashB, 'Same OTP for different emails must produce distinct hashes (isolation)');

  // Verification matching
  assert.equal(verifyOtpHash(emailA, otp, hashA), true, 'Correct OTP and email must verify');
  assert.equal(verifyOtpHash(emailA, '000000', hashA), false, 'Wrong OTP must not verify');
  assert.equal(verifyOtpHash(emailB, otp, hashA), false, 'Cross-email OTP reuse must not verify');

  // Unguessable tokens for unsubscribe and management
  const unsubToken1 = generateSecureToken();
  const unsubToken2 = generateSecureToken();
  assert.notEqual(unsubToken1, unsubToken2, 'Secure tokens must be unique');
  assert.equal(unsubToken1.length, 48, 'Secure token must be 24 bytes hex (48 chars)');
});

// --------------------------------------------------------------------------
// 4. In-Memory Sliding Window Rate Limiting
// --------------------------------------------------------------------------
test('4. Endpoint Abuse Prevention Rate Limiter', () => {
  const testKey = `test_rate_limit_${Date.now()}`;
  const maxReq = 3;
  const windowMs = 500;

  const r1 = checkRateLimit(testKey, maxReq, windowMs);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(testKey, maxReq, windowMs);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(testKey, maxReq, windowMs);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be blocked
  const r4 = checkRateLimit(testKey, maxReq, windowMs);
  assert.equal(r4.allowed, false);
  assert.ok(r4.retryAfterSec > 0);
});

// --------------------------------------------------------------------------
// 5. Hostinger SMTP Diagnostics & Secret Masking
// --------------------------------------------------------------------------
test('5. Hostinger SMTP Diagnostics Never Leak Passwords', () => {
  const diag = getSmtpDiagnostics();
  assert.equal(typeof diag.host, 'string');
  assert.equal(typeof diag.port, 'number');
  assert.equal(typeof diag.secure, 'boolean');

  // Check that password is NOT included in diagnostic object
  assert.equal('pass' in diag, false, 'Diagnostic output must never contain "pass"');
  assert.equal('password' in diag, false, 'Diagnostic output must never contain "password"');

  // If user is set, it must be masked
  if (diag.userConfigured) {
    assert.ok(diag.userEmail.includes('*'), 'User email must be masked in diagnostics');
  }
});

// --------------------------------------------------------------------------
// 6. Arabic RTL Email Templates Rendering
// --------------------------------------------------------------------------
test('6. Arabic RTL Email Templates Verification', () => {
  const siteUrl = 'https://waslislam.fun';

  // 6.1 OTP Verification Email Template
  const otpEmail = renderConfirmSubscriptionEmail({
    siteUrl,
    otp: '937105',
    expiresMinutes: 10,
    categoriesLabels: ['الرسالة الإيمانية اليومية', 'تذكيرات العبادات والنوافل']
  });

  assert.ok(otpEmail.subject.includes('رمز التحقق'), 'Subject must contain OTP verification title');
  assert.ok(otpEmail.html.includes('dir="rtl"'), 'HTML must have dir="rtl" attribute');
  assert.ok(otpEmail.html.includes('منصة وصل الإسلامية'), 'Must include platform title');
  assert.ok(otpEmail.html.includes('937105'), 'HTML must contain the 6-digit OTP code');
  assert.ok(otpEmail.html.includes('10 دقائق'), 'HTML must state 10-minute expiry');
  assert.ok(!otpEmail.html.includes('/api/notifications/verify?token='), 'Must NOT contain clickable verification links');
  assert.ok(otpEmail.text.includes('937105'), 'Plain text must contain OTP');
  assert.ok(otpEmail.text.includes('10 دقائق'), 'Plain text must state 10-minute expiry');

  // 6.2 Daily Islamic Email Template
  const dailyEmail = renderDailyIslamicEmail({
    siteUrl,
    dateFormatted: 'الاثنين 12 أكتوبر 2026',
    hijriFormatted: '29 ربيع الثاني 1448 هـ',
    ayah: {
      surahNameAr: 'الفاتحة',
      surahNumber: 1,
      ayahNumber: 2,
      textAr: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      surahUrl: `${siteUrl}/#quran?surah=1`
    },
    hadith: {
      textAr: 'إنما الأعمال بالنيات',
      sourceAr: 'صحيح البخاري (1)',
      narratorAr: 'عمر بن الخطاب رضي الله عنه'
    },
    dhikr: {
      titleAr: 'أذكار الصباح',
      textAr: 'أصبحنا وأصبح الملك لله',
      virtueAr: 'الاعتراف بملك الله والتوكل عليه'
    },
    manageUrl: `${siteUrl}/notifications/manage?token=manage_xyz`,
    unsubscribeUrl: `${siteUrl}/api/notifications/unsubscribe?token=unsub_xyz`
  });

  assert.ok(dailyEmail.subject.includes('رسالتك الإيمانية'), 'Subject must contain daily label');
  assert.ok(dailyEmail.html.includes('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'), 'Must render Quran ayah');
  assert.ok(dailyEmail.html.includes('صحيح البخاري'), 'Must render authentic Hadith source');
  assert.ok(dailyEmail.html.includes('manage_xyz'), 'Must contain personalized manage link');
  assert.ok(dailyEmail.html.includes('unsub_xyz'), 'Must contain personalized unsubscribe link');
  assert.ok(dailyEmail.text.includes('unsub_xyz'), 'Plain text must contain unsubscribe link');

  // 6.3 Preferences Updated Template
  const prefEmail = renderPreferencesUpdatedEmail({
    siteUrl,
    categoriesLabels: ['الرسالة الإيمانية اليومية'],
    manageUrl: `${siteUrl}/notifications/manage?token=manage_xyz`,
    unsubscribeUrl: `${siteUrl}/api/notifications/unsubscribe?token=unsub_xyz`
  });
  assert.ok(prefEmail.subject.includes('تحديث تفضيلات'), 'Subject must indicate preference update');
  assert.ok(prefEmail.html.includes('manage_xyz'));

  // 6.4 Unsubscribe Confirmation Template
  const unsubEmail = renderUnsubscribeConfirmationEmail({
    siteUrl,
    resubscribeUrl: siteUrl
  });
  assert.ok(unsubEmail.subject.includes('إلغاء الاشتراك'), 'Subject must indicate cancellation');
  assert.ok(unsubEmail.html.includes('تم إيقاف إرسال الإشعارات'));

  // 6.5 Admin Alert Template
  const alertEmail = renderAdminAlertEmail({
    siteUrl,
    alertType: 'SMTP_FAILURE_RATE',
    summary: 'High error rate detected in daily batch',
    details: 'Error: 535 Authentication failed',
    timestamp: '2026-10-12 05:00:00',
    affectedCount: 5
  });
  assert.ok(alertEmail.subject.includes('[تنبيه إداري - وصل الإسلامية]'));
  assert.ok(alertEmail.html.includes('SMTP_FAILURE_RATE'));
  assert.ok(alertEmail.html.includes('High error rate'));
});

// --------------------------------------------------------------------------
// 7. Daily Verified Content Aggregator
// --------------------------------------------------------------------------
test('7. Daily Verified Islamic Content Selector', () => {
  const content = getDailyEmailContent(new Date('2026-10-12T05:00:00Z'));

  assert.ok(content.dateStr, 'Must provide ISO date string');
  assert.ok(content.ayah.textAr.length > 0, 'Must have verified Quran text');
  assert.ok(content.ayah.surahNameAr.length > 0, 'Must have Surah name');
  assert.ok(content.ayah.surahNumber >= 1 && content.ayah.surahNumber <= 114);
  assert.ok(content.hadith.textAr.length > 0, 'Must have Hadith text');
  assert.ok(content.hadith.sourceAr.includes('صحيح'), 'Must be from authentic Hadith collections');
  assert.ok(content.dhikr.textAr.length > 0, 'Must have authentic Dhikr');
});

// --------------------------------------------------------------------------
// 8. SMTP Send Failure Protection (Dry Run / Missing Credentials)
// --------------------------------------------------------------------------
test('8. SMTP Real Send Rejection When Unconfigured', async () => {
  // If SMTP credentials are empty or invalid, sendHostingerEmail must reject honestly
  // and NOT simulate false delivery
  const cfg = getSmtpConfig();
  if (!cfg.pass) {
    const res = await sendHostingerEmail({
      to: 'unconfigured@test.com',
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test'
    });
    assert.equal(res.success, false, 'Must fail honestly when SMTP_PASS is empty');
    assert.ok(res.error, 'Must provide an error explanation');
  }
});
