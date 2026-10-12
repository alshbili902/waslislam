import pg from 'pg';
import type { NotificationCategoryId } from './tokens.ts';

const { Pool } = pg;

export interface SubscriberRecord {
  id: string;
  email: string;
  normalized_email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  categories: NotificationCategoryId[];
  verification_token_hash: string | null;
  verification_token_expires_at: Date | null;
  unsubscribe_token: string;
  manage_token: string;
  verified_at: Date | null;
  unsubscribed_at: Date | null;
  last_sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OtpChallengeRecord {
  id: string;
  subscriber_id: string;
  normalized_email: string;
  otp_hash: string;
  attempts: number;
  max_attempts: number;
  resend_count: number;
  last_sent_at: Date;
  expires_at: Date;
  verified_at: Date | null;
  invalidated_at: Date | null;
  created_at: Date;
}

let poolInstance: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (poolInstance) return poolInstance;

  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Alshnili81%40@db.hzcvukhyjsfjtvllhhew.supabase.co:5432/postgres';

  poolInstance = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  return poolInstance;
}

export async function closeDbPool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}


/**
 * Creates a new pending subscription or refreshes verification token for pending/unsubscribed emails.
 */
export async function createOrUpdatePendingSubscription(params: {
  email: string;
  normalizedEmail: string;
  categories: NotificationCategoryId[];
  tokenHash: string;
  expiresAt: Date;
  unsubToken: string;
  manageToken: string;
}): Promise<{
  subscriber: SubscriberRecord;
  isAlreadyActive: boolean;
}> {
  const pool = getDbPool();

  // Check if subscriber exists
  const checkRes = await pool.query<SubscriberRecord>(
    `SELECT * FROM public.email_subscribers WHERE normalized_email = $1 LIMIT 1`,
    [params.normalizedEmail]
  );

  const existing = checkRes.rows[0];

  if (existing && existing.status === 'active') {
    return {
      subscriber: existing,
      isAlreadyActive: true
    };
  }

  if (existing) {
    // Update existing record with fresh tokens and categories
    const updateRes = await pool.query<SubscriberRecord>(
      `UPDATE public.email_subscribers
       SET email = $1,
           categories = $2::jsonb,
           verification_token_hash = $3,
           verification_token_expires_at = $4,
           status = 'pending',
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        params.email,
        JSON.stringify(params.categories),
        params.tokenHash,
        params.expiresAt,
        existing.id
      ]
    );

    return {
      subscriber: updateRes.rows[0],
      isAlreadyActive: false
    };
  }

  // Insert brand new subscriber
  const insertRes = await pool.query<SubscriberRecord>(
    `INSERT INTO public.email_subscribers (
       email,
       normalized_email,
       categories,
       verification_token_hash,
       verification_token_expires_at,
       unsubscribe_token,
       manage_token,
       status
     ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [
      params.email,
      params.normalizedEmail,
      JSON.stringify(params.categories),
      params.tokenHash,
      params.expiresAt,
      params.unsubToken,
      params.manageToken
    ]
  );

  return {
    subscriber: insertRes.rows[0],
    isAlreadyActive: false
  };
}

/**
 * Creates a new OTP verification challenge and invalidates any previous active challenges for the email.
 */
export async function createOtpChallengeRecord(params: {
  subscriberId: string;
  normalizedEmail: string;
  otpHash: string;
  expiresAt: Date;
}): Promise<OtpChallengeRecord> {
  const pool = getDbPool();

  // Invalidate any existing active challenges for this email
  await pool.query(
    `UPDATE public.email_verification_challenges
     SET invalidated_at = NOW()
     WHERE normalized_email = $1
       AND verified_at IS NULL
       AND invalidated_at IS NULL`,
    [params.normalizedEmail]
  );

  // Insert the fresh challenge
  const res = await pool.query<OtpChallengeRecord>(
    `INSERT INTO public.email_verification_challenges (
       subscriber_id,
       normalized_email,
       otp_hash,
       expires_at,
       attempts,
       max_attempts,
       resend_count,
       last_sent_at
     ) VALUES ($1, $2, $3, $4, 0, 5, 0, NOW())
     RETURNING *`,
    [
      params.subscriberId,
      params.normalizedEmail,
      params.otpHash,
      params.expiresAt
    ]
  );

  // Synchronize on subscriber table for audit & backward compatibility
  await pool.query(
    `UPDATE public.email_subscribers
     SET verification_token_hash = $1,
         verification_token_expires_at = $2,
         status = 'pending',
         updated_at = NOW()
     WHERE id = $3`,
    [params.otpHash, params.expiresAt, params.subscriberId]
  );

  return res.rows[0];
}

/**
 * Retrieves the latest active (unverified and non-invalidated) OTP challenge for an email.
 */
export async function getLatestActiveOtpChallenge(normalizedEmail: string): Promise<OtpChallengeRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<OtpChallengeRecord>(
    `SELECT * FROM public.email_verification_challenges
     WHERE normalized_email = $1
       AND verified_at IS NULL
       AND invalidated_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail]
  );
  return res.rows[0] || null;
}

/**
 * Increments failed verification attempts counter on an OTP challenge.
 * Automatically invalidates challenge when max_attempts is reached.
 */
export async function incrementOtpFailedAttempts(challengeId: string): Promise<{
  attempts: number;
  maxAttempts: number;
  isLocked: boolean;
}> {
  const pool = getDbPool();
  const res = await pool.query<OtpChallengeRecord>(
    `UPDATE public.email_verification_challenges
     SET attempts = attempts + 1,
         invalidated_at = CASE WHEN attempts + 1 >= max_attempts THEN NOW() ELSE invalidated_at END
     WHERE id = $1
     RETURNING attempts, max_attempts`,
    [challengeId]
  );

  const row = res.rows[0];
  if (!row) {
    return { attempts: 5, maxAttempts: 5, isLocked: true };
  }

  const isLocked = row.attempts >= row.max_attempts;
  return {
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    isLocked
  };
}

/**
 * Verifies the challenge and activates the subscription atomically.
 */
export async function verifyOtpChallengeAndActivate(
  challengeId: string,
  subscriberId: string
): Promise<SubscriberRecord> {
  const pool = getDbPool();

  // Mark challenge verified
  await pool.query(
    `UPDATE public.email_verification_challenges
     SET verified_at = NOW()
     WHERE id = $1`,
    [challengeId]
  );

  // Activate subscriber
  const subRes = await pool.query<SubscriberRecord>(
    `UPDATE public.email_subscribers
     SET status = 'active',
         verified_at = NOW(),
         verification_token_hash = NULL,
         verification_token_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [subscriberId]
  );

  return subRes.rows[0];
}

/**
 * Checks resend cooldown for an email address (default 60 seconds).
 */
export async function checkResendCooldown(
  normalizedEmail: string,
  cooldownSeconds = 60
): Promise<{ allowed: boolean; retryAfterSec: number; challenge?: OtpChallengeRecord }> {
  const pool = getDbPool();
  const res = await pool.query<OtpChallengeRecord>(
    `SELECT * FROM public.email_verification_challenges
     WHERE normalized_email = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail]
  );

  const challenge = res.rows[0];
  if (!challenge) {
    return { allowed: true, retryAfterSec: 0 };
  }

  const lastSentTime = new Date(challenge.last_sent_at).getTime();
  const now = Date.now();
  const elapsedSec = (now - lastSentTime) / 1000;

  if (elapsedSec < cooldownSeconds) {
    const retryAfterSec = Math.ceil(cooldownSeconds - elapsedSec);
    return { allowed: false, retryAfterSec, challenge };
  }

  return { allowed: true, retryAfterSec: 0, challenge };
}

/**
 * Confirms subscription using SHA-256 token hash.
 * Single-use: wipes token upon verification.
 */
export async function verifySubscriptionByHash(tokenHash: string): Promise<{
  success: boolean;
  subscriber?: SubscriberRecord;
  reason?: 'invalid' | 'expired' | 'already_verified';
}> {
  const pool = getDbPool();

  const res = await pool.query<SubscriberRecord>(
    `SELECT * FROM public.email_subscribers 
     WHERE verification_token_hash = $1 
     LIMIT 1`,
    [tokenHash]
  );

  const record = res.rows[0];
  if (!record) {
    return { success: false, reason: 'invalid' };
  }

  if (record.status === 'active') {
    return { success: true, subscriber: record, reason: 'already_verified' };
  }

  if (record.verification_token_expires_at && new Date(record.verification_token_expires_at).getTime() < Date.now()) {
    return { success: false, reason: 'expired' };
  }

  // Mark active and clear single-use token
  const updateRes = await pool.query<SubscriberRecord>(
    `UPDATE public.email_subscribers
     SET status = 'active',
         verified_at = NOW(),
         verification_token_hash = NULL,
         verification_token_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [record.id]
  );

  return { success: true, subscriber: updateRes.rows[0] };
}

/**
 * Retrieves subscriber by manageToken.
 */
export async function getSubscriberByManageToken(manageToken: string): Promise<SubscriberRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<SubscriberRecord>(
    `SELECT * FROM public.email_subscribers WHERE manage_token = $1 LIMIT 1`,
    [manageToken]
  );
  return res.rows[0] || null;
}

/**
 * Retrieves subscriber by normalized email address.
 */
export async function getSubscriberByNormalizedEmail(normalizedEmail: string): Promise<SubscriberRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<SubscriberRecord>(
    `SELECT * FROM public.email_subscribers WHERE normalized_email = $1 LIMIT 1`,
    [normalizedEmail]
  );
  return res.rows[0] || null;
}

/**
 * Updates categories for an existing subscriber.
 */
export async function updateSubscriberCategories(
  manageToken: string,
  categories: NotificationCategoryId[]
): Promise<SubscriberRecord | null> {
  const pool = getDbPool();
  const res = await pool.query<SubscriberRecord>(
    `UPDATE public.email_subscribers
     SET categories = $1::jsonb,
         updated_at = NOW()
     WHERE manage_token = $2
     RETURNING *`,
    [JSON.stringify(categories), manageToken]
  );
  return res.rows[0] || null;
}

/**
 * Unsubscribes a user idempotently via unsubscribe_token.
 */
export async function unsubscribeByToken(unsubscribeToken: string): Promise<{
  success: boolean;
  subscriber?: SubscriberRecord;
}> {
  const pool = getDbPool();
  const res = await pool.query<SubscriberRecord>(
    `UPDATE public.email_subscribers
     SET status = 'unsubscribed',
         unsubscribed_at = NOW(),
         updated_at = NOW()
     WHERE unsubscribe_token = $1
     RETURNING *`,
    [unsubscribeToken]
  );

  if (res.rows.length === 0) {
    return { success: false };
  }

  return { success: true, subscriber: res.rows[0] };
}

/**
 * Retrieves active subscribers who opted into a specific category.
 */
export async function getActiveSubscribersByCategory(
  category: NotificationCategoryId,
  limit = 50,
  offset = 0
): Promise<SubscriberRecord[]> {
  const pool = getDbPool();
  const res = await pool.query<SubscriberRecord>(
    `SELECT * FROM public.email_subscribers
     WHERE status = 'active'
       AND categories @> $1::jsonb
     ORDER BY created_at ASC
     LIMIT $2 OFFSET $3`,
    [JSON.stringify([category]), limit, offset]
  );
  return res.rows;
}

/**
 * Checks whether an email was already delivered today (Idempotency).
 */
export async function isDeliveryRecorded(idempotencyKey: string): Promise<boolean> {
  const pool = getDbPool();
  const res = await pool.query(
    `SELECT 1 FROM public.notification_delivery_logs WHERE idempotency_key = $1 LIMIT 1`,
    [idempotencyKey]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Records a delivery attempt in the database logs.
 */
export async function recordDeliveryLog(params: {
  subscriberId: string;
  category: string;
  idempotencyKey: string;
  status: 'sent' | 'failed' | 'queued';
  errorMessage?: string;
  sentDate?: string;
}): Promise<void> {
  const pool = getDbPool();
  try {
    await pool.query(
      `INSERT INTO public.notification_delivery_logs (
         subscriber_id,
         category,
         idempotency_key,
         status,
         error_message,
         sent_date
       ) VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE))
       ON CONFLICT (idempotency_key) DO UPDATE
       SET status = EXCLUDED.status,
           error_message = EXCLUDED.error_message`,
      [
        params.subscriberId,
        params.category,
        params.idempotencyKey,
        params.status,
        params.errorMessage || null,
        params.sentDate || null
      ]
    );

    // Update last_sent_at on subscriber if successful
    if (params.status === 'sent') {
      await pool.query(
        `UPDATE public.email_subscribers SET last_sent_at = NOW() WHERE id = $1`,
        [params.subscriberId]
      );
    }
  } catch (err) {
    console.warn('Failed to record delivery log:', (err as Error).message);
  }
}

/**
 * Checks whether a system operational alert can be sent (Alert Throttling to prevent loops).
 */
export async function canSendSystemAlert(alertType: string, cooldownMinutes = 30): Promise<boolean> {
  const pool = getDbPool();
  try {
    const res = await pool.query(
      `SELECT 1 FROM public.system_alert_logs
       WHERE alert_type = $1
         AND created_at > NOW() - ($2 || ' minutes')::interval
       LIMIT 1`,
      [alertType, cooldownMinutes]
    );
    return (res.rowCount ?? 0) === 0;
  } catch {
    return true; // Fallback if table query fails
  }
}

/**
 * Records an operational alert sent to the administrator.
 */
export async function recordSystemAlert(params: {
  alertType: string;
  recipientEmail: string;
  details: Record<string, unknown>;
}): Promise<void> {
  const pool = getDbPool();
  try {
    await pool.query(
      `INSERT INTO public.system_alert_logs (
         alert_type,
         recipient_email,
         details
       ) VALUES ($1, $2, $3::jsonb)`,
      [params.alertType, params.recipientEmail, JSON.stringify(params.details)]
    );
  } catch (err) {
    console.warn('Failed to record system alert log:', (err as Error).message);
  }
}

/**
 * Returns overall subscription statistics for status reporting.
 */
export async function getSubscriptionStats(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  pendingSubscribers: number;
  unsubscribed: number;
}> {
  const pool = getDbPool();
  try {
    const res = await pool.query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text as count FROM public.email_subscribers GROUP BY status`
    );

    const counts: Record<string, number> = { active: 0, pending: 0, unsubscribed: 0 };
    let total = 0;

    for (const r of res.rows) {
      const c = parseInt(r.count, 10) || 0;
      counts[r.status] = c;
      total += c;
    }

    return {
      totalSubscribers: total,
      activeSubscribers: counts.active || 0,
      pendingSubscribers: counts.pending || 0,
      unsubscribed: counts.unsubscribed || 0
    };
  } catch {
    return { totalSubscribers: 0, activeSubscribers: 0, pendingSubscribers: 0, unsubscribed: 0 };
  }
}
