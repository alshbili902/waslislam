import {
  normalizeEmail,
  sanitizeCategories,
  generateSecureToken,
  checkRateLimit,
  generateOtpCode,
  normalizeOtpInput,
  hashOtp,
  verifyOtpHash,
  OTP_CONFIG,
  NOTIFICATION_CATEGORIES,
  type NotificationCategoryId
} from './tokens.ts';
import {
  getSmtpConfig,
  sendHostingerEmail,
  verifySmtpConnection,
  type SendEmailResult
} from './hostingerSmtp.ts';
import {
  renderOtpVerificationEmail,
  renderDailyIslamicEmail,
  renderPreferencesUpdatedEmail,
  renderUnsubscribeConfirmationEmail,
  renderAdminAlertEmail
} from './templates.ts';
import {
  createOrUpdatePendingSubscription,
  createOtpChallengeRecord,
  getLatestActiveOtpChallenge,
  incrementOtpFailedAttempts,
  verifyOtpChallengeAndActivate,
  checkResendCooldown,
  getSubscriberByManageToken,
  getSubscriberByNormalizedEmail,
  updateSubscriberCategories,
  unsubscribeByToken,
  getActiveSubscribersByCategory,
  isDeliveryRecorded,
  recordDeliveryLog,
  canSendSystemAlert,
  recordSystemAlert,
  getSubscriptionStats,
  type SubscriberRecord
} from './subscriberDb.ts';
import { getDailyEmailContent } from './dailyContent.ts';

export interface SubscribeResult {
  success: boolean;
  message: string;
  isAlreadyActive?: boolean;
  email?: string;
  challengeId?: string;
  cooldownSeconds?: number;
  expiresMinutes?: number;
  retryAfterSec?: number;
}

export interface VerifyResult {
  success: boolean;
  message: string;
  status: 'active' | 'invalid' | 'expired' | 'already_verified' | 'max_attempts_exceeded';
  remainingAttempts?: number;
}

/**
 * Initiates an email subscription request by issuing a 6-digit numeric OTP.
 * Completely independent of user accounts.
 */
export async function handleSubscribeRequest(
  rawEmail: unknown,
  rawCategories: unknown,
  clientIp = 'unknown'
): Promise<SubscribeResult> {
  // 1. Rate limiting per client IP (max 10 requests per 10 minutes)
  const rateLimit = checkRateLimit(`sub_ip_${clientIp}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${rateLimit.retryAfterSec} ثانية.`,
      retryAfterSec: rateLimit.retryAfterSec
    };
  }

  // 2. Validate email address
  const emailNorm = normalizeEmail(rawEmail);
  if (!emailNorm.valid) {
    return {
      success: false,
      message: emailNorm.error || 'يرجى إدخال عنوان بريد إلكتروني صالح.'
    };
  }

  // 3. Rate limiting per email (max 5 requests per 15 minutes)
  const emailRateLimit = checkRateLimit(`sub_email_${emailNorm.email}`, 5, 15 * 60 * 1000);
  if (!emailRateLimit.allowed) {
    return {
      success: false,
      message: 'تم تجاوز عدد طلبات الاشتراك لهذا البريد. يرجى الانتظار قليلاً والمحاولة لاحقًا.',
      retryAfterSec: emailRateLimit.retryAfterSec
    };
  }

  // 4. Sanitize categories
  const categories = sanitizeCategories(rawCategories);

  // 5. Generate secure 6-digit OTP code and HMAC hash
  const otpCode = generateOtpCode();
  const otpHmac = hashOtp(emailNorm.email, otpCode);
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000);
  const unsubToken = generateSecureToken();
  const manageToken = generateSecureToken();

  // 6. Persist pending subscription record in DB
  const { subscriber, isAlreadyActive } = await createOrUpdatePendingSubscription({
    email: emailNorm.email,
    normalizedEmail: emailNorm.email,
    categories,
    tokenHash: otpHmac,
    expiresAt,
    unsubToken,
    manageToken
  });

  if (isAlreadyActive) {
    return {
      success: true,
      isAlreadyActive: true,
      email: emailNorm.email,
      message: 'هذا البريد الإلكتروني مشترك ومفعل بالفعل في إشعارات وصل الإسلامية.'
    };
  }

  // 7. Persist OTP challenge record
  const challenge = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: emailNorm.email,
    otpHash: otpHmac,
    expiresAt
  });

  // 8. Compose and deliver OTP verification email via Hostinger SMTP
  const cfg = getSmtpConfig();
  const categoryLabels = categories.map(catId => {
    const found = NOTIFICATION_CATEGORIES.find(c => c.id === catId);
    return found ? found.titleAr : catId;
  });

  const emailContent = renderOtpVerificationEmail({
    siteUrl: cfg.siteUrl,
    otp: otpCode,
    expiresMinutes: OTP_CONFIG.EXPIRATION_MINUTES,
    categoriesLabels: categoryLabels
  });

  const sendResult: SendEmailResult = await sendHostingerEmail({
    to: subscriber.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });

  if (!sendResult.success) {
    // Record operational alert if critical
    await notifyAdminOnFailure(
      'SUBSCRIPTION_OTP_SEND_FAILED',
      `فشل إرسال رمز التحقق (OTP) للعنوان ${subscriber.email}`,
      sendResult.error || 'Unknown SMTP error'
    );

    return {
      success: false,
      message: sendResult.error || 'تعذر إرسال رمز التحقق في الوقت الحالي. يرجى المحاولة لاحقًا.'
    };
  }

  return {
    success: true,
    message: 'تم إرسال رمز التحقق المكوّن من 6 أرقام إلى بريدك الإلكتروني.',
    email: emailNorm.email,
    challengeId: challenge.id,
    cooldownSeconds: OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
    expiresMinutes: OTP_CONFIG.EXPIRATION_MINUTES
  };
}

/**
 * Validates a 6-digit numeric OTP submitted by visitor and activates subscription.
 */
export async function handleVerifyOtpRequest(
  rawEmail: unknown,
  rawOtp: unknown,
  clientIp = 'unknown'
): Promise<VerifyResult> {
  // 1. Rate limiting per client IP (max 20 verification attempts per 10 minutes)
  const rateLimit = checkRateLimit(`verify_ip_${clientIp}`, 20, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      status: 'invalid',
      message: `تم تجاوز عدد محاولات التحقق المسموح بها. يرجى الانتظار ${rateLimit.retryAfterSec} ثانية.`
    };
  }

  // 2. Validate email
  const emailNorm = normalizeEmail(rawEmail);
  if (!emailNorm.valid) {
    return {
      success: false,
      status: 'invalid',
      message: emailNorm.error || 'عنوان البريد الإلكتروني غير صالح.'
    };
  }

  // 3. Normalize OTP (convert Arabic-Indic and Persian numerals to 0-9)
  const otpClean = normalizeOtpInput(rawOtp);
  if (otpClean.length !== OTP_CONFIG.LENGTH) {
    return {
      success: false,
      status: 'invalid',
      message: `يرجى إدخال رمز التحقق المكوّن من ${OTP_CONFIG.LENGTH} أرقام كاملة.`
    };
  }

  // 4. Retrieve active challenge from DB
  const challenge = await getLatestActiveOtpChallenge(emailNorm.email);
  if (!challenge) {
    return {
      success: false,
      status: 'invalid',
      message: 'لم يتم العثور على رمز تحقق صالح أو ربما انتهت صلاحيته. يرجى طلب رمز جديد.'
    };
  }

  // 5. Check if challenge is expired (10 minutes)
  const isExpired = new Date(challenge.expires_at).getTime() < Date.now();
  if (isExpired) {
    return {
      success: false,
      status: 'expired',
      message: `انتهت صلاحية رمز التحقق (${OTP_CONFIG.EXPIRATION_MINUTES} دقائق). يرجى طلب رمز جديد.`
    };
  }

  // 6. Check if challenge reached maximum attempts
  if (challenge.attempts >= challenge.max_attempts) {
    return {
      success: false,
      status: 'max_attempts_exceeded',
      remainingAttempts: 0,
      message: `تم استنفاد محاولات إدخال الرمز (${challenge.max_attempts} محاولات). يرجى طلب رمز تحقق جديد.`
    };
  }

  // 7. Verify cryptographic HMAC representation (timing-safe comparison)
  const isMatch = verifyOtpHash(emailNorm.email, otpClean, challenge.otp_hash);

  if (!isMatch) {
    // Increment failed attempts
    const attemptResult = await incrementOtpFailedAttempts(challenge.id);
    const remaining = Math.max(0, attemptResult.maxAttempts - attemptResult.attempts);

    if (attemptResult.isLocked || remaining <= 0) {
      return {
        success: false,
        status: 'max_attempts_exceeded',
        remainingAttempts: 0,
        message: `تم استنفاد محاولات إدخال الرمز (${attemptResult.maxAttempts} محاولات). يرجى طلب رمز تحقق جديد.`
      };
    }

    return {
      success: false,
      status: 'invalid',
      remainingAttempts: remaining,
      message: `رمز التحقق غير صحيح. تبقى لك ${remaining} ${remaining === 1 ? 'محاولة' : 'محاولات'}.`
    };
  }

  // 8. Success: activate subscriber and verify challenge
  await verifyOtpChallengeAndActivate(challenge.id, challenge.subscriber_id);

  return {
    success: true,
    status: 'active',
    message: 'تم التحقق من بريدك الإلكتروني بنجاح، وتم تفعيل الإشعارات البريدية.'
  };
}

/**
 * Resends a fresh 6-digit OTP code to a subscriber with 60s cooldown enforcement.
 */
export async function handleResendOtpRequest(
  rawEmail: unknown,
  clientIp = 'unknown'
): Promise<SubscribeResult> {
  // 1. Rate limiting per client IP
  const rateLimit = checkRateLimit(`resend_ip_${clientIp}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${rateLimit.retryAfterSec} ثانية.`,
      retryAfterSec: rateLimit.retryAfterSec
    };
  }

  // 2. Validate email
  const emailNorm = normalizeEmail(rawEmail);
  if (!emailNorm.valid) {
    return {
      success: false,
      message: emailNorm.error || 'يرجى إدخال عنوان بريد إلكتروني صالح.'
    };
  }

  // 3. Enforce 60-second cooldown
  const cooldown = await checkResendCooldown(emailNorm.email, OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
  if (!cooldown.allowed) {
    return {
      success: false,
      message: `يرجى الانتظار ${cooldown.retryAfterSec} ثانية قبل إعادة إرسال الرمز.`,
      retryAfterSec: cooldown.retryAfterSec,
      cooldownSeconds: cooldown.retryAfterSec
    };
  }

  // 4. Rate limiting per email (max 5 resends per hour)
  const emailRateLimit = checkRateLimit(`resend_email_${emailNorm.email}`, 5, 60 * 60 * 1000);
  if (!emailRateLimit.allowed) {
    return {
      success: false,
      message: 'تم تجاوز الحد الأقصى لإعادة إرسال الرموز لهذا البريد (5 مرات في الساعة). يرجى المحاولة لاحقًا.',
      retryAfterSec: emailRateLimit.retryAfterSec
    };
  }

  // 5. Look up subscriber
  const subscriber = await getSubscriberByNormalizedEmail(emailNorm.email);

  if (!subscriber) {
    return {
      success: false,
      message: 'لم يتم العثور على طلب اشتراك مرتبط بهذا البريد. يرجى إدخال البريد مجددًا.'
    };
  }

  if (subscriber.status === 'active') {
    return {
      success: true,
      isAlreadyActive: true,
      email: emailNorm.email,
      message: 'هذا البريد الإلكتروني مفعل ونشط بالفعل في إشعارات وصل الإسلامية.'
    };
  }

  // 6. Generate fresh OTP code and HMAC hash
  const otpCode = generateOtpCode();
  const otpHmac = hashOtp(emailNorm.email, otpCode);
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000);

  // 7. Persist new challenge record (invalidates previous challenges)
  const challenge = await createOtpChallengeRecord({
    subscriberId: subscriber.id,
    normalizedEmail: emailNorm.email,
    otpHash: otpHmac,
    expiresAt
  });

  // 8. Compose and send email via Hostinger SMTP
  const cfg = getSmtpConfig();
  const categoryLabels = (subscriber.categories || []).map((catId: NotificationCategoryId) => {
    const found = NOTIFICATION_CATEGORIES.find(c => c.id === catId);
    return found ? found.titleAr : catId;
  });

  const emailContent = renderOtpVerificationEmail({
    siteUrl: cfg.siteUrl,
    otp: otpCode,
    expiresMinutes: OTP_CONFIG.EXPIRATION_MINUTES,
    categoriesLabels: categoryLabels
  });

  const sendResult: SendEmailResult = await sendHostingerEmail({
    to: subscriber.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });

  if (!sendResult.success) {
    await notifyAdminOnFailure(
      'RESEND_OTP_FAILED',
      `فشل إعادة إرسال رمز التحقق للعنوان ${subscriber.email}`,
      sendResult.error || 'Unknown SMTP error'
    );

    return {
      success: false,
      message: sendResult.error || 'تعذر إرسال رمز التحقق الجديد. يرجى المحاولة لاحقًا.'
    };
  }

  return {
    success: true,
    message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
    email: emailNorm.email,
    challengeId: challenge.id,
    cooldownSeconds: OTP_CONFIG.RESEND_COOLDOWN_SECONDS,
    expiresMinutes: OTP_CONFIG.EXPIRATION_MINUTES
  };
}

/**
 * Backward compatibility helper for verification requests.
 */
export async function handleVerificationRequest(rawToken: unknown): Promise<VerifyResult> {
  return {
    success: false,
    status: 'invalid',
    message: 'تم استبدال روابط التفعيل برموز التحقق المباشرة (OTP). يرجى إدخال الرمز في الموقع.'
  };
}

/**
 * Retrieves subscriber preferences using secure manage token.
 */
export async function handleGetPreferences(rawToken: unknown): Promise<{
  success: boolean;
  subscriber?: {
    maskedEmail: string;
    categories: NotificationCategoryId[];
    status: string;
  };
  message?: string;
}> {
  if (typeof rawToken !== 'string' || !rawToken.trim()) {
    return { success: false, message: 'رابط إدارة التفضيلات غير صالح.' };
  }

  const sub = await getSubscriberByManageToken(rawToken.trim());
  if (!sub || sub.status === 'unsubscribed') {
    return { success: false, message: 'لم يتم العثور على اشتراك نشط مرتبط بهذا الرابط.' };
  }

  // Mask email for privacy (e.g. "a***@example.com")
  const parts = sub.email.split('@');
  const user = parts[0] || '';
  const domain = parts[1] || '';
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
  const maskedEmail = `${maskedUser}@${domain}`;

  return {
    success: true,
    subscriber: {
      maskedEmail,
      categories: sub.categories || ['daily_islamic'],
      status: sub.status
    }
  };
}

/**
 * Updates categories for an existing subscriber using manage token.
 */
export async function handleUpdatePreferences(
  rawToken: unknown,
  rawCategories: unknown
): Promise<{ success: boolean; message: string }> {
  if (typeof rawToken !== 'string' || !rawToken.trim()) {
    return { success: false, message: 'رمز إدارة التفضيلات غير صالح.' };
  }

  const categories = sanitizeCategories(rawCategories);
  const updated = await updateSubscriberCategories(rawToken.trim(), categories);

  if (!updated) {
    return { success: false, message: 'تعذر العثور على الاشتراك أو تم إلغاؤه.' };
  }

  // Send confirmation email
  const cfg = getSmtpConfig();
  const manageUrl = `${cfg.siteUrl}/notifications/manage?token=${updated.manage_token}`;
  const unsubscribeUrl = `${cfg.siteUrl}/api/notifications/unsubscribe?token=${updated.unsubscribe_token}`;

  const categoryLabels = categories.map(catId => {
    const found = NOTIFICATION_CATEGORIES.find(c => c.id === catId);
    return found ? found.titleAr : catId;
  });

  const emailContent = renderPreferencesUpdatedEmail({
    siteUrl: cfg.siteUrl,
    categoriesLabels: categoryLabels,
    manageUrl,
    unsubscribeUrl
  });

  // Asynchronous notification (non-blocking for response)
  sendHostingerEmail({
    to: updated.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  }).catch(() => null);

  return {
    success: true,
    message: 'تم تحديث تفضيلات الإشعارات بنجاح.'
  };
}

/**
 * Unsubscribes a user safely and idempotently.
 */
export async function handleUnsubscribeRequest(rawToken: unknown): Promise<{
  success: boolean;
  message: string;
}> {
  if (typeof rawToken !== 'string' || !rawToken.trim()) {
    return { success: false, message: 'رابط إلغاء الاشتراك غير صالح.' };
  }

  const res = await unsubscribeByToken(rawToken.trim());
  if (!res.success || !res.subscriber) {
    return {
      success: true, // Idempotent: if already unsubscribed, still confirm cancellation
      message: 'تم إلغاء الاشتراك بالفعل، ولن تصلك أي رسائل مستقبلية.'
    };
  }

  const cfg = getSmtpConfig();
  const emailContent = renderUnsubscribeConfirmationEmail({
    siteUrl: cfg.siteUrl,
    resubscribeUrl: cfg.siteUrl
  });

  // Send confirmation of cancellation
  sendHostingerEmail({
    to: res.subscriber.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  }).catch(() => null);

  return {
    success: true,
    message: 'تم إلغاء اشتراكك في إشعارات وصل الإسلامية بنجاح.'
  };
}

/**
 * Executes scheduled recurring delivery of the Daily Islamic Email.
 * Implements batching, Hostinger rate compliance, idempotency, and retry with backoff.
 */
export async function executeDailyIslamicDelivery(targetDate = new Date()): Promise<{
  success: boolean;
  totalSubscribers: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  errors: string[];
}> {
  const cfg = getSmtpConfig();
  const content = getDailyEmailContent(targetDate, cfg.siteUrl);
  const dateStr = content.dateStr;

  let offset = 0;
  const batchSize = 25; // Controlled batch size to respect Hostinger rate policies
  let totalSubscribers = 0;
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  while (true) {
    const subscribers: SubscriberRecord[] = await getActiveSubscribersByCategory(
      'daily_islamic',
      batchSize,
      offset
    );

    if (subscribers.length === 0) break;
    totalSubscribers += subscribers.length;

    for (const sub of subscribers) {
      // 1. Idempotency Check
      const idempotencyKey = `${sub.id}_daily_islamic_${dateStr}`;
      const alreadySent = await isDeliveryRecorded(idempotencyKey);

      if (alreadySent) {
        skippedCount++;
        continue;
      }

      // 2. Prepare personalized template
      const manageUrl = `${cfg.siteUrl}/notifications/manage?token=${sub.manage_token}`;
      const unsubscribeUrl = `${cfg.siteUrl}/api/notifications/unsubscribe?token=${sub.unsubscribe_token}`;

      const rendered = renderDailyIslamicEmail({
        siteUrl: cfg.siteUrl,
        dateFormatted: content.dateFormatted,
        hijriFormatted: content.hijriFormatted,
        ayah: content.ayah,
        hadith: content.hadith,
        dhikr: content.dhikr,
        manageUrl,
        unsubscribeUrl
      });

      // 3. Delivery with bounded exponential backoff retry for transient errors
      let sendResult: SendEmailResult = { success: false, error: 'Not attempted' };
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        sendResult = await sendHostingerEmail({
          to: sub.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text
        });

        if (sendResult.success) break;

        // Permanent failures (e.g. 550 recipient rejected) do not need retry
        if (sendResult.error?.includes('تم رفض عنوان المستلم')) {
          break;
        }

        if (attempt < maxRetries) {
          // Wait 1s, then 2s
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
        }
      }

      // 4. Record delivery result
      if (sendResult.success) {
        sentCount++;
        await recordDeliveryLog({
          subscriberId: sub.id,
          category: 'daily_islamic',
          idempotencyKey,
          status: 'sent',
          sentDate: dateStr
        });
      } else {
        failedCount++;
        const errMsg = sendResult.error || 'Failed to deliver';
        errors.push(`Email ${sub.email}: ${errMsg}`);

        await recordDeliveryLog({
          subscriberId: sub.id,
          category: 'daily_islamic',
          idempotencyKey,
          status: 'failed',
          errorMessage: errMsg,
          sentDate: dateStr
        });
      }

      // Polite pause between messages to protect sender reputation
      await new Promise(r => setTimeout(r, 200));
    }

    offset += batchSize;
  }

  // 5. Operational alert check: alert operator if high failure rate
  if (failedCount > 0 && failedCount >= sentCount) {
    await notifyAdminOnFailure(
      'DAILY_DELIVERY_BATCH_ALERT',
      `حدثت أخطاء متكررة أثناء إرسال الدفعة اليومية (${failedCount} فشل من أصل ${totalSubscribers}).`,
      errors.slice(0, 10).join('\n')
    );
  }

  return {
    success: failedCount === 0,
    totalSubscribers,
    sentCount,
    skippedCount,
    failedCount,
    errors: errors.slice(0, 10)
  };
}

/**
 * Sends an administrative alert for system failures (throttled).
 */
export async function notifyAdminOnFailure(
  alertType: string,
  summary: string,
  errorDetails: string
): Promise<void> {
  const cfg = getSmtpConfig();
  if (!cfg.adminEmail) return;

  const canSend = await canSendSystemAlert(alertType, 30);
  if (!canSend) {
    console.warn(`[Alert Throttled] ${alertType}: ${summary}`);
    return;
  }

  const emailContent = renderAdminAlertEmail({
    siteUrl: cfg.siteUrl,
    alertType,
    summary,
    details: errorDetails,
    timestamp: new Date().toLocaleString('ar-SA')
  });

  const res = await sendHostingerEmail({
    to: cfg.adminEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });

  if (res.success) {
    await recordSystemAlert({
      alertType,
      recipientEmail: cfg.adminEmail,
      details: { summary, errorDetails }
    });
  }
}

export { verifySmtpConnection, getSubscriptionStats };
