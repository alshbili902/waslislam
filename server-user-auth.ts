import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================================
// CONFIGURATION & CONSTANTS
// ==========================================================
export const USER_COOKIE_NAME = 'wasl_user_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const isProduction = process.env.NODE_ENV === 'production';

// Reserved Usernames (Lower-case)
export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'support',
  'security',
  'api',
  'system',
  'wasl',
  'waslislam',
  'moderator',
  'owner',
  'null',
  'undefined',
  'superuser',
  'dashboard',
  'login',
  'register',
  'settings',
  'auth',
  'user',
  'help',
  'info',
  'service',
  'bot',
  'profile',
  'account',
]);

// Database Pool
const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null;

// ==========================================================
// DATA MODELS & IN-MEMORY CACHE
// ==========================================================
export interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  usernameNormalized: string;
  passwordHash: string;
  passwordSalt: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'super_admin';
  city: string;
  country: string;
  bio?: string;
  preferredReciter?: string;
  prayerCalculationMethod?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  username: string;
  usernameNormalized: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory cache for fast lookups & offline fallback
const memoryUsers = new Map<string, UserAccount>(); // key: usernameNormalized
const memorySessions = new Map<string, UserSession>(); // key: sessionId

// ==========================================================
// RATE LIMITING
// ==========================================================
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();
const registerRateLimits = new Map<string, RateLimitRecord>();

function cleanRateLimits() {
  const now = Date.now();
  for (const [ip, rec] of loginRateLimits.entries()) {
    if (rec.blockedUntil && rec.blockedUntil < now && now - rec.firstAttemptAt > 15 * 60 * 1000) {
      loginRateLimits.delete(ip);
    }
  }
  for (const [ip, rec] of registerRateLimits.entries()) {
    if (now - rec.firstAttemptAt > 60 * 60 * 1000) {
      registerRateLimits.delete(ip);
    }
  }
}
setInterval(cleanRateLimits, 5 * 60 * 1000);

function checkLoginRateLimit(ip: string, bypass = false): { allowed: boolean; waitSeconds?: number } {
  if (bypass) return { allowed: true };
  const now = Date.now();
  const rec = loginRateLimits.get(ip);
  if (!rec) return { allowed: true };

  if (rec.blockedUntil && rec.blockedUntil > now) {
    const waitSeconds = Math.ceil((rec.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // If window expired (15 mins), reset
  if (now - rec.firstAttemptAt > 15 * 60 * 1000) {
    loginRateLimits.delete(ip);
    return { allowed: true };
  }

  const maxAttempts = (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1')) && !isProduction ? 500 : 5;

  if (rec.attempts >= maxAttempts) {
    rec.blockedUntil = now + 15 * 60 * 1000;
    const waitSeconds = Math.ceil((rec.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

function recordLoginFailure(ip: string) {
  const now = Date.now();
  const rec = loginRateLimits.get(ip) || { attempts: 0, firstAttemptAt: now };
  rec.attempts += 1;
  loginRateLimits.set(ip, rec);
}

function clearLoginRateLimit(ip: string) {
  loginRateLimits.delete(ip);
}

function checkRegisterRateLimit(ip: string, bypass = false): { allowed: boolean; waitSeconds?: number } {
  if (bypass) return { allowed: true };
  const now = Date.now();
  const rec = registerRateLimits.get(ip);
  if (!rec) return { allowed: true };

  if (now - rec.firstAttemptAt > 60 * 60 * 1000) {
    registerRateLimits.delete(ip);
    return { allowed: true };
  }

  const maxAttempts = (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1')) && !isProduction ? 500 : 10;

  if (rec.attempts >= maxAttempts) {
    const waitSeconds = Math.ceil((rec.firstAttemptAt + 60 * 60 * 1000 - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

function recordRegisterAttempt(ip: string) {
  const now = Date.now();
  const rec = registerRateLimits.get(ip) || { attempts: 0, firstAttemptAt: now };
  rec.attempts += 1;
  registerRateLimits.set(ip, rec);
}

// ==========================================================
// SECURITY & HASHING HELPERS
// ==========================================================
export function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

export function verifyPassword(password: string, expectedHash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(derivedKey.toString('hex'), 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (keyBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, expectedBuf);
  } catch {
    return false;
  }
}

// ==========================================================
// USERNAME VALIDATION
// ==========================================================
export interface UsernameValidation {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

export function validateUsername(username: string): UsernameValidation {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'اسم المستخدم مطلوب.' };
  }

  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { isValid: false, error: 'يجب أن يكون اسم المستخدم بين 3 و30 حرفاً.' };
  }

  // English letters, numbers, and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية وأرقام وشرطة سفلية (_) دون مسافات أو رموز خاصة.',
    };
  }

  const normalized = trimmed.toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return { isValid: false, error: 'اسم المستخدم هذا محجوز من قبل النظام، يرجى اختيار اسم آخر.' };
  }

  return { isValid: true, normalized };
}

// ==========================================================
// DATABASE PERSISTENCE HELPERS
// ==========================================================
async function findUserByUsernameNormalized(norm: string): Promise<UserAccount | null> {
  // 1. Check database if pool is configured
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT id, full_name, username, username_normalized, password_hash, password_salt, 
                avatar_url, role, city, country, bio, preferred_reciter, prayer_calculation_method,
                created_at, updated_at, last_login_at
         FROM profiles 
         WHERE username_normalized = $1 
         LIMIT 1`,
        [norm]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        const account: UserAccount = {
          id: r.id,
          fullName: r.full_name || '',
          username: r.username || '',
          usernameNormalized: r.username_normalized || '',
          passwordHash: r.password_hash || '',
          passwordSalt: r.password_salt || '',
          avatarUrl: r.avatar_url || '',
          role: r.role || 'user',
          city: r.city || 'مكة المكرمة',
          country: r.country || 'المملكة العربية السعودية',
          bio: r.bio || '',
          preferredReciter: r.preferred_reciter || 'ar.alafasy',
          prayerCalculationMethod: r.prayer_calculation_method || 'UmmAlQura',
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
        };
        memoryUsers.set(norm, account);
        return account;
      }
    } catch (err: any) {
      console.warn('DB findUserByUsernameNormalized error, falling back to memory:', err.message);
    }
  }

  // 2. In-memory fallback
  return memoryUsers.get(norm) || null;
}

async function findUserById(id: string): Promise<UserAccount | null> {
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT id, full_name, username, username_normalized, password_hash, password_salt, 
                avatar_url, role, city, country, bio, preferred_reciter, prayer_calculation_method,
                created_at, updated_at, last_login_at
         FROM profiles 
         WHERE id = $1 
         LIMIT 1`,
        [id]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        const account: UserAccount = {
          id: r.id,
          fullName: r.full_name || '',
          username: r.username || '',
          usernameNormalized: r.username_normalized || '',
          passwordHash: r.password_hash || '',
          passwordSalt: r.password_salt || '',
          avatarUrl: r.avatar_url || '',
          role: r.role || 'user',
          city: r.city || 'مكة المكرمة',
          country: r.country || 'المملكة العربية السعودية',
          bio: r.bio || '',
          preferredReciter: r.preferred_reciter || 'ar.alafasy',
          prayerCalculationMethod: r.prayer_calculation_method || 'UmmAlQura',
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
        };
        if (account.usernameNormalized) {
          memoryUsers.set(account.usernameNormalized, account);
        }
        return account;
      }
    } catch (err: any) {
      console.warn('DB findUserById error, falling back to memory:', err.message);
    }
  }

  for (const acc of memoryUsers.values()) {
    if (acc.id === id) return acc;
  }
  return null;
}

async function insertUserAccount(account: UserAccount): Promise<void> {
  // Store in memory
  memoryUsers.set(account.usernameNormalized, account);

  // Store in PostgreSQL
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO profiles (
          id, full_name, username, username_normalized, password_hash, password_salt,
          role, country, city, preferred_reciter, prayer_calculation_method, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          username = EXCLUDED.username,
          username_normalized = EXCLUDED.username_normalized,
          password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          updated_at = EXCLUDED.updated_at`,
        [
          account.id,
          account.fullName,
          account.username,
          account.usernameNormalized,
          account.passwordHash,
          account.passwordSalt,
          account.role,
          account.country,
          account.city,
          account.preferredReciter || 'ar.alafasy',
          account.prayerCalculationMethod || 'UmmAlQura',
          account.createdAt,
          account.updatedAt,
        ]
      );

      // Initialize default tables for streaks & settings
      await pool.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
         VALUES ($1, 0, 0, NULL)
         ON CONFLICT (user_id) DO NOTHING`,
        [account.id]
      ).catch(() => {});

      await pool.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [account.id]
      ).catch(() => {});

      await pool.query(
        `INSERT INTO notification_preferences (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [account.id]
      ).catch(() => {});
    } catch (err: any) {
      console.error('DB insertUserAccount error:', err.message);
      // Re-throw unique violation if duplicate username caught at DB level
      if (err.code === '23505') {
        throw new Error('اسم المستخدم مستخدم بالفعل، اختر اسم مستخدم آخر.');
      }
      throw err;
    }
  }
}

async function updateLastLogin(id: string): Promise<void> {
  const now = new Date().toISOString();
  for (const u of memoryUsers.values()) {
    if (u.id === id) {
      u.lastLoginAt = now;
      break;
    }
  }
  if (pool) {
    try {
      await pool.query('UPDATE profiles SET last_login_at = NOW() WHERE id = $1', [id]);
    } catch {}
  }
}

// ==========================================================
// SESSION MANAGEMENT
// ==========================================================
export function createSession(user: UserAccount): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: UserSession = {
    sessionId,
    userId: user.id,
    username: user.username,
    usernameNormalized: user.usernameNormalized,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  memorySessions.set(sessionId, session);
  return sessionId;
}

export function getSession(sessionId: string): UserSession | null {
  if (!sessionId) return null;
  const session = memorySessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    memorySessions.delete(sessionId);
    return null;
  }
  return session;
}

export function destroySession(sessionId: string): void {
  if (sessionId) {
    memorySessions.delete(sessionId);
  }
}

// Set cookie helper
export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(USER_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

// Clear cookie helper
export function clearSessionCookie(res: Response) {
  res.cookie(USER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ==========================================================
// EXPRESS ROUTER
// ==========================================================
export const userAuthRouter = express.Router();

/**
 * Check if username is available (live check)
 * GET /api/auth/check-username?username=...
 */
userAuthRouter.get('/check-username', async (req: Request, res: Response): Promise<void> => {
  const raw = String(req.query.username || '');
  const validation = validateUsername(raw);
  if (!validation.isValid) {
    res.json({
      available: false,
      reason: validation.error,
    });
    return;
  }

  const existing = await findUserByUsernameNormalized(validation.normalized!);
  if (existing) {
    res.json({
      available: false,
      reason: 'اسم المستخدم مستخدم بالفعل، اختر اسم مستخدم آخر.',
    });
    return;
  }

  res.json({
    available: true,
    normalized: validation.normalized,
  });
});

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { clientName, username, password, confirmPassword }
 */
userAuthRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkRegisterRateLimit(ip);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      error: `تم تجاوز الحد الأقصى لإنشاء الحسابات مؤقتاً. يرجى الانتظار ${rate.waitSeconds} ثانية والمحاولة مجدداً.`,
    });
    return;
  }

  recordRegisterAttempt(ip);

  const { clientName, username, password, confirmPassword } = req.body || {};

  // 1. Validate Client Name (اسم العميل)
  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    res.status(400).json({ success: false, error: 'اسم العميل مطلوب.' });
    return;
  }
  const cleanClientName = clientName.trim();
  if (cleanClientName.length < 2 || cleanClientName.length > 100) {
    res.status(400).json({ success: false, error: 'يجب أن يكون اسم العميل بين حرفين و 100 حرف.' });
    return;
  }

  // 2. Validate Username (اسم المستخدم)
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    res.status(400).json({ success: false, error: usernameValidation.error });
    return;
  }
  const normalized = usernameValidation.normalized!;

  // 3. Validate Password (كلمة المرور)
  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'كلمة المرور مطلوبة.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.' });
    return;
  }

  // 4. Validate Confirm Password (تطابق كلمتي المرور)
  if (!confirmPassword || password !== confirmPassword) {
    res.status(400).json({ success: false, error: 'كلمتا المرور غير متطابقتين.' });
    return;
  }

  // 5. Check if username is already taken
  const existing = await findUserByUsernameNormalized(normalized);
  if (existing) {
    res.status(409).json({
      success: false,
      error: 'اسم المستخدم مستخدم بالفعل، اختر اسم مستخدم آخر.',
    });
    return;
  }

  try {
    // 6. Secure Hashing
    const { hash, salt } = hashPassword(password);
    const userId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newAccount: UserAccount = {
      id: userId,
      fullName: cleanClientName,
      username: username.trim(),
      usernameNormalized: normalized,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'user',
      country: 'المملكة العربية السعودية',
      city: 'مكة المكرمة',
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLoginAt: nowIso,
    };

    // 7. Save to Database
    await insertUserAccount(newAccount);

    // 8. Create Secure Session
    const sessionId = createSession(newAccount);
    setSessionCookie(res, sessionId);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح.',
      user: {
        id: newAccount.id,
        fullName: newAccount.fullName,
        username: newAccount.username,
        usernameNormalized: newAccount.usernameNormalized,
        role: newAccount.role,
        city: newAccount.city,
        country: newAccount.country,
        createdAt: newAccount.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.',
    });
  }
});

/**
 * Login user
 * POST /api/auth/login
 * Body: { username, password }
 */
userAuthRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkLoginRateLimit(ip);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      error: `تم قفل محاولات الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار ${rate.waitSeconds} ثانية والمحاولة مجدداً.`,
    });
    return;
  }

  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    recordLoginFailure(ip);
    res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    });
    return;
  }

  const normalized = username.trim().toLowerCase();
  const user = await findUserByUsernameNormalized(normalized);

  if (!user || !user.passwordHash || !user.passwordSalt) {
    recordLoginFailure(ip);
    res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    });
    return;
  }

  const isPasswordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isPasswordValid) {
    recordLoginFailure(ip);
    res.status(401).json({
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    });
    return;
  }

  // Clear rate limits on successful login
  clearLoginRateLimit(ip);
  await updateLastLogin(user.id);

  // Issue session
  const sessionId = createSession(user);
  setSessionCookie(res, sessionId);

  res.json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح.',
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      usernameNormalized: user.usernameNormalized,
      role: user.role,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
userAuthRouter.post('/logout', (req: Request, res: Response): void => {
  const sessionId = req.cookies?.[USER_COOKIE_NAME];
  if (sessionId) {
    destroySession(sessionId);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
});

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
userAuthRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies?.[USER_COOKIE_NAME];
  if (!sessionId) {
    res.json({ authenticated: false });
    return;
  }

  const session = getSession(sessionId);
  if (!session) {
    clearSessionCookie(res);
    res.json({ authenticated: false });
    return;
  }

  // Retrieve fresh user record
  const user = await findUserById(session.userId);
  if (!user) {
    destroySession(sessionId);
    clearSessionCookie(res);
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      usernameNormalized: user.usernameNormalized,
      role: user.role,
      avatarUrl: user.avatarUrl,
      city: user.city,
      country: user.country,
      bio: user.bio,
      preferredReciter: user.preferredReciter,
      prayerCalculationMethod: user.prayerCalculationMethod,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});
