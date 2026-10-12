import crypto from 'node:crypto';

/**
 * Standard Email Notification Categories for Wasl Islamic
 */
export const NOTIFICATION_CATEGORIES = [
  {
    id: 'daily_islamic',
    titleAr: 'الرسالة الإيمانية اليومية',
    titleEn: 'Daily Islamic Message',
    descAr: 'آية قرآنية موثقة، حديث نبوي شريف، وأذكار وأدعية مأثورة كل صباح.',
    descEn: 'Verified Quranic ayah, authentic hadith, and morning adhkar.',
    defaultSelected: true
  },
  {
    id: 'worship_reminders',
    titleAr: 'تذكيرات العبادات والنوافل',
    titleEn: 'Worship Reminders',
    descAr: 'تذكير بصيام الاثنين والخميس، الأيام البيض، وسنن الصلاة والأذكار.',
    descEn: 'Reminders for voluntary fasting, White Days, and sunnah prayers.',
    defaultSelected: false
  },
  {
    id: 'seasonal_updates',
    titleAr: 'مواسم الخير والمناسبات الإسلامية',
    titleEn: 'Islamic Seasons & Occasions',
    descAr: 'تنبيهات بدخول شهر رمضان، عشر ذي الحجة، الأيام الفاضلة، والمناسبات الكبرى.',
    descEn: 'Alerts for Ramadan, 10 Days of Dhul-Hijjah, and blessed occasions.',
    defaultSelected: true
  },
  {
    id: 'educational_content',
    titleAr: 'المحتوى والدروس الإيمانية',
    titleEn: 'Educational Islamic Lessons',
    descAr: 'جديد مسارات التعلم، علوم القرآن، والفوائد الإيمانية من أكاديمية وصل.',
    descEn: 'Curated learning paths and Quranic insights from Wasl Academy.',
    defaultSelected: false
  }
] as const;

export type NotificationCategoryId = typeof NOTIFICATION_CATEGORIES[number]['id'];

export const VALID_CATEGORY_IDS: Set<string> = new Set(
  NOTIFICATION_CATEGORIES.map(c => c.id)
);

/**
 * Validates and normalizes an email address.
 * Prevents header injection (CRLF), strips spaces, forces lowercase.
 */
export function normalizeEmail(email: unknown): { valid: boolean; email: string; error?: string } {
  if (typeof email !== 'string') {
    return { valid: false, email: '', error: 'صيغة البريد الإلكتروني غير صحيحة.' };
  }

  const trimmed = email.trim().toLowerCase();

  // Guard against header injection characters
  if (/[\r\n\0%<>]/.test(trimmed)) {
    return { valid: false, email: '', error: 'البريد الإلكتروني يحتوي على محارف غير مسموحة.' };
  }

  // RFC 5322 compliant regex for safe emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return { valid: false, email: '', error: 'يرجى إدخال عنوان بريد إلكتروني صالح.' };
  }

  return { valid: true, email: trimmed };
}

/**
 * Filter and validate category selections.
 */
export function sanitizeCategories(categories: unknown): NotificationCategoryId[] {
  if (!Array.isArray(categories)) {
    return ['daily_islamic'];
  }
  const filtered = categories.filter((c): c is NotificationCategoryId => 
    typeof c === 'string' && VALID_CATEGORY_IDS.has(c)
  );
  return filtered.length > 0 ? filtered : ['daily_islamic'];
}

/**
 * OTP Configuration Constants
 */
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRATION_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
  MAX_RESENDS_PER_HOUR: 5
} as const;

/**
 * Generates a cryptographically secure 6-digit numeric OTP with leading zeros preserved.
 */
export function generateOtpCode(): string {
  const codeInt = crypto.randomInt(0, 1000000);
  return String(codeInt).padStart(OTP_CONFIG.LENGTH, '0');
}

/**
 * Normalizes user-input OTP digits:
 * Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to ASCII (0-9).
 * Strips spaces, dashes, or non-numeric characters.
 */
export function normalizeOtpInput(input: unknown): string {
  if (typeof input !== 'string' && typeof input !== 'number') return '';
  const str = String(input);
  return str
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9')
    .replace(/\D/g, '')
    .slice(0, OTP_CONFIG.LENGTH);
}

/**
 * Computes an HMAC-SHA256 representation of the OTP bound to the normalized email.
 */
export function hashOtp(normalizedEmail: string, otp: string): string {
  const secret = process.env.OTP_SECRET || 'wasl-islamic-otp-hmac-high-entropy-secret-key-2026';
  return crypto
    .createHmac('sha256', secret)
    .update(`${normalizedEmail.trim().toLowerCase()}:${otp.trim()}`)
    .digest('hex');
}

/**
 * Constant-time safe verification of OTP against stored HMAC hash.
 */
export function verifyOtpHash(normalizedEmail: string, candidateOtp: string, storedHash: string): boolean {
  if (!storedHash || !candidateOtp) return false;
  const candidateHash = hashOtp(normalizedEmail, candidateOtp);
  const bufA = Buffer.from(candidateHash, 'hex');
  const bufB = Buffer.from(storedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generates an unguessable token for unsubscribe and preference management.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Computes a SHA-256 hash of a string/token.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Cryptographic token generator helper.
 */
export function generateVerificationToken(hoursValid = 24): {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000);
  return { rawToken, tokenHash, expiresAt };
}


/**
 * In-memory sliding window rate limiter to protect public endpoints.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000).unref?.();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterSec: 0 };
}
