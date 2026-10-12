import test, { after } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateOtpCode,
  normalizeOtpInput,
  hashOtp,
  verifyOtpHash,
  OTP_CONFIG,
  normalizeEmail
} from '../src/lib/email/tokens.ts';

import {
  handleVerifyOtpRequest
} from '../src/lib/email/notificationService.ts';

import {
  createOrUpdatePendingSubscription,
  createOtpChallengeRecord,
  getLatestActiveOtpChallenge,
  incrementOtpFailedAttempts,
  verifyOtpChallengeAndActivate,
  checkResendCooldown,
  getActiveSubscribersByCategory,
  closeDbPool
} from '../src/lib/email/subscriberDb.ts';

// --------------------------------------------------------------------------
// 1. Six-Digit OTP Generation & Leading Zeros Preservation
// --------------------------------------------------------------------------
test('1. OTP Generation, 6-Digit Format & Leading Zeros', () => {
  const codes = new Set();
  let foundLeadingZero = false;

  for (let i = 0; i < 200; i++) {
    const code = generateOtpCode();
    assert.equal(code.length, 6, 'Must always be exactly 6 characters');
    assert.match(code, /^\d{6}$/, 'Must be strictly 6 numeric digits');
    if (code.startsWith('0')) {
      foundLeadingZero = true;
    }
    codes.add(code);
  }

  assert.ok(codes.size > 150, 'Randomness must produce high entropy without repeating static values');
  // Statistical check: 1 in 10 codes starts with '0' on average
  assert.ok(foundLeadingZero, 'Must preserve leading zeros when generated');
});

// --------------------------------------------------------------------------
// 2. Arabic & Persian Numerals Normalization
// --------------------------------------------------------------------------
test('2. Numeral Normalization for Arabic-Indic and Persian Digits', () => {
  // Eastern Arabic-Indic numerals
  assert.equal(normalizeOtpInput('٠١٢٣٤٥'), '012345');
  assert.equal(normalizeOtpInput('٦٧٨٩٠١'), '678901');

  // Persian numerals
  assert.equal(normalizeOtpInput('۱۲۳۴۵۶'), '123456');
  assert.equal(normalizeOtpInput('۷۸۹۰۱۲'), '789012');

  // Mixed typing with punctuation, spaces, and copy-paste
  assert.equal(normalizeOtpInput('  ٠١-٢٣ ٤٥  '), '012345');
  assert.equal(normalizeOtpInput('code: 987654!'), '987654');

  // Length constraints: truncates to exactly 6 digits
  assert.equal(normalizeOtpInput('1234567890'), '123456');
  assert.equal(normalizeOtpInput('123'), '123');
  assert.equal(normalizeOtpInput(null), '');
  assert.equal(normalizeOtpInput(undefined), '');
});

// --------------------------------------------------------------------------
// 3. Cryptographic HMAC Security & Email-Bound Isolation
// --------------------------------------------------------------------------
test('3. OTP Cryptographic Binding & Cross-Email Isolation', () => {
  const emailA = 'subscriber.alpha@waslislam.fun';
  const emailB = 'subscriber.beta@waslislam.fun';
  const sharedCode = '742910';

  const hashA = hashOtp(emailA, sharedCode);
  const hashB = hashOtp(emailB, sharedCode);

  assert.equal(hashA.length, 64);
  assert.equal(hashB.length, 64);
  assert.notEqual(hashA, hashB, 'Hashes must differ even with identical OTP (email-bound HMAC)');

  // Correct match
  assert.equal(verifyOtpHash(emailA, sharedCode, hashA), true);
  // Cross-email attempt: Email B trying to use Email A's code against hash A
  assert.equal(verifyOtpHash(emailB, sharedCode, hashA), false, 'Must prevent code generated for Email A from verifying Email B');
  // Incorrect code
  assert.equal(verifyOtpHash(emailA, '111111', hashA), false);
});

// --------------------------------------------------------------------------
// 4. Live Database: Challenge Lifecycle, Verification & Atomic Activation
// --------------------------------------------------------------------------
test('4. Database Challenge Creation, Verification, and Subscriber Activation', async () => {
  const uniqueEmail = `test.otp.${Date.now()}@waslislam.fun`;
  const unsubToken = `unsub_${Date.now()}`;
  const manageToken = `manage_${Date.now()}`;
  const otpCode = '820461';
  const otpHmac = hashOtp(uniqueEmail, otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 1. Create pending subscriber
  const { subscriber, isAlreadyActive } = await createOrUpdatePendingSubscription({
    email: uniqueEmail,
    normalizedEmail: uniqueEmail,
    categories: ['daily_islamic', 'seasonal_updates'],
    tokenHash: otpHmac,
    expiresAt,
    unsubToken,
    manageToken
  });

  assert.equal(isAlreadyActive, false);
  assert.equal(subscriber.status, 'pending');

  // 2. Pending subscribers must NOT receive active notifications
  const activeSubsBefore = await getActiveSubscribersByCategory('daily_islamic', 100, 0);
  assert.ok(!activeSubsBefore.some(s => s.normalized_email === uniqueEmail), 'Pending subscriber must not be in active notifications query');

  // 3. Create OTP challenge record
  const challenge = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: uniqueEmail,
    otpHash: otpHmac,
    expiresAt
  });

  assert.equal(challenge.attempts, 0);
  assert.equal(challenge.max_attempts, 5);
  assert.equal(challenge.verified_at, null);
  assert.equal(challenge.invalidated_at, null);

  // 4. Verify correct OTP via handleVerifyOtpRequest
  const verifyResult = await handleVerifyOtpRequest(uniqueEmail, otpCode, '127.0.0.1');
  assert.equal(verifyResult.success, true);
  assert.equal(verifyResult.status, 'active');

  // 5. Active subscribers DO appear in notifications query
  const activeSubsAfter = await getActiveSubscribersByCategory('daily_islamic', 100, 0);
  assert.ok(activeSubsAfter.some(s => s.normalized_email === uniqueEmail), 'Verified subscriber must now be in active notifications query');

  // 6. Reusing the same OTP must fail because challenge is already verified/consumed
  const reuseResult = await handleVerifyOtpRequest(uniqueEmail, otpCode, '127.0.0.1');
  assert.equal(reuseResult.success, false, 'Reusing a consumed OTP must be rejected');
  assert.equal(reuseResult.status, 'invalid', 'Consumed code must report invalid/already consumed');
});

// --------------------------------------------------------------------------
// 5. Attempt Limits (Max 5 Failed Attempts Lockout)
// --------------------------------------------------------------------------
test('5. Maximum Failed Attempt Enforcement (Locks at 5 attempts)', async () => {
  const uniqueEmail = `test.attempts.${Date.now()}@waslislam.fun`;
  const otpCode = '123987';
  const otpHmac = hashOtp(uniqueEmail, otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const { subscriber } = await createOrUpdatePendingSubscription({
    email: uniqueEmail,
    normalizedEmail: uniqueEmail,
    categories: ['daily_islamic'],
    tokenHash: otpHmac,
    expiresAt,
    unsubToken: `unsub_${Date.now()}`,
    manageToken: `manage_${Date.now()}`
  });

  const challenge = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: uniqueEmail,
    otpHash: otpHmac,
    expiresAt
  });

  // Fail 1st through 4th attempt
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await handleVerifyOtpRequest(uniqueEmail, '000000', '127.0.0.1');
    assert.equal(res.success, false);
    assert.equal(res.status, 'invalid');
    assert.equal(res.remainingAttempts, 5 - attempt);
  }

  // 5th attempt: Reaches maximum attempts
  const fifthAttempt = await handleVerifyOtpRequest(uniqueEmail, '000000', '127.0.0.1');
  assert.equal(fifthAttempt.success, false);
  assert.equal(fifthAttempt.status, 'max_attempts_exceeded');
  assert.equal(fifthAttempt.remainingAttempts, 0);

  // Even if the user now types the CORRECT code, the challenge has been invalidated
  const postLockAttempt = await handleVerifyOtpRequest(uniqueEmail, otpCode, '127.0.0.1');
  assert.equal(postLockAttempt.success, false, 'Must reject even correct code after challenge lockout');
});

// --------------------------------------------------------------------------
// 6. Resend Invalidates Previous Code & Cooldown Enforcement
// --------------------------------------------------------------------------
test('6. Resending OTP Invalidates Previous Active Code & Enforces Cooldown', async () => {
  const uniqueEmail = `test.resend.${Date.now()}@waslislam.fun`;
  const code1 = '111222';
  const code2 = '333444';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const { subscriber } = await createOrUpdatePendingSubscription({
    email: uniqueEmail,
    normalizedEmail: uniqueEmail,
    categories: ['daily_islamic'],
    tokenHash: hashOtp(uniqueEmail, code1),
    expiresAt,
    unsubToken: `unsub_${Date.now()}`,
    manageToken: `manage_${Date.now()}`
  });

  // 1. Issue Code 1
  const ch1 = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: uniqueEmail,
    otpHash: hashOtp(uniqueEmail, code1),
    expiresAt
  });

  // Cooldown check right after issuing: must block immediate resend (60s)
  const cooldownCheck = await checkResendCooldown(uniqueEmail, 60);
  assert.equal(cooldownCheck.allowed, false, 'Must enforce 60s cooldown');
  assert.ok(cooldownCheck.retryAfterSec > 0 && cooldownCheck.retryAfterSec <= 60);

  // 2. Issue Code 2 (simulating fresh challenge creation on resend)
  const ch2 = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: uniqueEmail,
    otpHash: hashOtp(uniqueEmail, code2),
    expiresAt
  });

  // 3. Verify Code 1 is now INVALIDATED and rejected
  const tryOldCode = await handleVerifyOtpRequest(uniqueEmail, code1, '127.0.0.1');
  assert.equal(tryOldCode.success, false, 'Old code must be invalidated by fresh resend');

  // 4. Verify Code 2 succeeds
  const tryNewCode = await handleVerifyOtpRequest(uniqueEmail, code2, '127.0.0.1');
  assert.equal(tryNewCode.success, true, 'Newest code must succeed');
  assert.equal(tryNewCode.status, 'active');
});

// --------------------------------------------------------------------------
// 7. Expired Code Rejection (10 Minutes Expiry)
// --------------------------------------------------------------------------
test('7. Expired OTP Challenges Are Rejected', async () => {
  const uniqueEmail = `test.expired.${Date.now()}@waslislam.fun`;
  const code = '555666';
  // Already expired in the past
  const pastExpiresAt = new Date(Date.now() - 60 * 1000);

  const { subscriber } = await createOrUpdatePendingSubscription({
    email: uniqueEmail,
    normalizedEmail: uniqueEmail,
    categories: ['daily_islamic'],
    tokenHash: hashOtp(uniqueEmail, code),
    expiresAt: pastExpiresAt,
    unsubToken: `unsub_${Date.now()}`,
    manageToken: `manage_${Date.now()}`
  });

  await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: uniqueEmail,
    otpHash: hashOtp(uniqueEmail, code),
    expiresAt: pastExpiresAt
  });

  const res = await handleVerifyOtpRequest(uniqueEmail, code, '127.0.0.1');
  assert.equal(res.success, false);
  assert.equal(res.status, 'expired', 'Expired challenge must return expired status');
});

after(async () => {
  await closeDbPool();
});


