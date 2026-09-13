import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const adminRouter = Router();

// ==========================================
// 1. Session Store (Server-Side)
// ==========================================
interface AdminSession {
  username: string;
  createdAt: number;
  expiresAt: number;
}

const adminSessions = new Map<string, AdminSession>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, {
    username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
  return token;
}

function verifySession(token?: string): AdminSession | null {
  if (!token) return null;
  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return null;
  }
  return session;
}

function revokeSession(token?: string) {
  if (token) {
    adminSessions.delete(token);
  }
}

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now > session.expiresAt) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

// ==========================================
// 2. Rate Limiter (Brute Force Protection)
// ==========================================
interface RateLimitRecord {
  count: number;
  lockedUntil: number;
  firstAttempt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes

function checkRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // Reset if lockout expired
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  // Reset count if older than 15 minutes window
  if (now - record.firstAttempt > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0, firstAttempt: now };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  loginAttempts.set(ip, record);
}

function resetFailedAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// ==========================================
// 3. Audit Log System
// ==========================================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
  ip?: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: 'init-1',
    timestamp: new Date().toISOString(),
    action: 'System Startup',
    resource: 'Admin Security Engine',
    status: 'success',
    details: 'تم بدء تشغيل نظام أمان الإدارة المعزول بنجاح',
  },
];

export function logAuditEvent(
  action: string,
  resource: string,
  resourceId?: string,
  status: 'success' | 'failed' | 'warning' = 'success',
  details?: string,
  ip?: string
) {
  const entry: AuditLogEntry = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    action,
    resource,
    resourceId,
    status,
    details,
    ip: ip ? ip.replace(/^.*:/, '') : undefined,
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
}

// ==========================================
// 4. Initial Seed Data (Sections & Islamic Content)
// ==========================================
export interface AdminSectionItem {
  id: string;
  name: string;
  type: string; // 'dhikr' | 'hadith' | 'dua' | 'quran' | 'fatwa' | 'article'
  order: number;
  isActive: boolean;
  itemCount: number;
}

export interface AdminContentItem {
  id: string;
  sectionId: string;
  sectionName: string;
  contentType: string; // 'ذكر' | 'حديث' | 'دعاء' | 'آية' | 'فتوى' | 'مقال'
  title?: string;
  text: string;
  source: string;
  narrator?: string;
  status: 'published' | 'draft' | 'needs_review' | 'rejected';
  verification: 'verified' | 'needs_review' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

let adminSections: AdminSectionItem[] = [
  { id: 'sec-1', name: 'أذكار الصباح', type: 'dhikr', order: 1, isActive: true, itemCount: 12 },
  { id: 'sec-2', name: 'أذكار المساء', type: 'dhikr', order: 2, isActive: true, itemCount: 10 },
  { id: 'sec-3', name: 'صحيح الأحاديث النبوية', type: 'hadith', order: 3, isActive: true, itemCount: 15 },
  { id: 'sec-4', name: 'أدعية من القرآن والسنة', type: 'dua', order: 4, isActive: true, itemCount: 8 },
  { id: 'sec-5', name: 'القرآن الكريم والتفاسير', type: 'quran', order: 5, isActive: true, itemCount: 114 },
  { id: 'sec-6', name: 'فتاوى ومعارف رمضانية', type: 'fatwa', order: 6, isActive: true, itemCount: 6 },
];

let adminContents: AdminContentItem[] = [
  {
    id: 'cnt-1',
    sectionId: 'sec-1',
    sectionName: 'أذكار الصباح',
    contentType: 'ذكر',
    title: 'سيد الاستغفار',
    text: '«اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ»',
    source: 'صحيح البخاري (٦٣٠٦)',
    narrator: 'شداد بن أوس رضي الله عنه',
    status: 'published',
    verification: 'verified',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
  },
  {
    id: 'cnt-2',
    sectionId: 'sec-3',
    sectionName: 'صحيح الأحاديث النبوية',
    contentType: 'حديث',
    title: 'حديث إنما الأعمال بالنيات',
    text: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
    source: 'متفق عليه: البخاري (١) ومسلم (١٩٠٧)',
    narrator: 'عمر بن الخطاب رضي الله عنه',
    status: 'published',
    verification: 'verified',
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-12T15:00:00Z',
  },
  {
    id: 'cnt-3',
    sectionId: 'sec-4',
    sectionName: 'أدعية من القرآن والسنة',
    contentType: 'دعاء',
    title: 'دعاء جامع لخيري الدنيا والآخرة',
    text: '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»',
    source: 'سورة البقرة • الآية ٢٠١',
    status: 'published',
    verification: 'verified',
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-09-11T12:00:00Z',
  },
  {
    id: 'cnt-4',
    sectionId: 'sec-6',
    sectionName: 'فتاوى ومعارف رمضانية',
    contentType: 'فتوى',
    title: 'حكم صيام الست من شوال قبل قضاء رمضان',
    text: 'الأولى والأحوط للمسلم أن يبدأ بقضاء ما عليه من رمضان ثم يصوم الست من شوال؛ لأن الفرض مقدم على النفل، ولظاهر قول النبي ﷺ: «من صام رمضان ثم أتبعه ستاً من شوال».',
    source: 'اللجنة الدائمة للبحوث العلمية والإفتاء',
    status: 'needs_review',
    verification: 'needs_review',
    createdAt: '2026-09-10T16:00:00Z',
    updatedAt: '2026-09-13T10:00:00Z',
  },
];

// ==========================================
// 4.1 Donation Platforms & Ibn Baz Seeds
// ==========================================
export interface AdminDonationPlatform {
  id: string;
  name: string;
  description: string;
  url: string;
  officialEntity: string;
  supervisingEntity: string;
  logoUrl?: string;
  categories: string[];
  features: string[];
  verified: boolean;
  status: 'verified' | 'pending_review' | 'rejected' | 'inactive';
  sortOrder: number;
  verificationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBinBazLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'general' | 'fatwas' | 'nur' | 'books' | 'audios' | 'articles';
  categoryLabelAr: string;
  verified: boolean;
  status: 'verified' | 'draft' | 'inactive';
  sortOrder: number;
  highlight?: boolean;
  createdAt: string;
  updatedAt: string;
}

let adminDonationPlatforms: AdminDonationPlatform[] = [
  {
    id: 'plat-ehsan',
    name: 'منصة إحسان',
    description: 'منظومة وطنية غير ربحية رائدة أُطلقت بموجب أمر سامٍ لتعزيز قيم العمل الخيري في المملكة وتسهيل التبرع الموثوق في شتى المجالات الخيرية والاجتماعية بشفافية وحوكمة عالية.',
    url: 'https://ehsan.sa/',
    officialEntity: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)',
    supervisingEntity: 'لجنة إشرافية تضم 12 جهة حكومية (منها الموارد البشرية، العدل، والداخلية)',
    logoUrl: 'https://ehsan.sa/favicon.ico',
    categories: ['تبرع عام', 'الزكاة', 'الأوقاف', 'عمارة المساجد', 'صدقة جارية', 'تفريج الكرب', 'كفالة الأيتام', 'المرضى والرعاية الصحية', 'سقيا الماء', 'المشاريع الخيرية'],
    features: [
      'خدمة فرص التبرع المباشر والسريع',
      'حاسبة ودفع زكاة المال وزكاة الفطر',
      'منصة وقفي للأصول والصناديق الوقفية',
      'برنامج تيسرت وتفريج كرب الغارمين',
      'عمارة المساجد وسقيا الماء',
      'التبرع الدوري المجدول',
      'إصدار التقارير للمتبرعين وشهادات التبرع الرسمية'
    ],
    verified: true,
    status: 'verified',
    sortOrder: 1,
    verificationDate: '2026-09-13T00:00:00Z',
    notes: 'تم التحقق من النطاق الرسمي ومطابقة شهادة SSL وهيئة الإشراف الحكومية.',
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'plat-tabarru',
    name: 'المنصة الوطنية للتبرعات — تبرع',
    description: 'الواجهة الوطنية الرسمية المعتمدة لجمع وإيصال التبرعات الخيرية لمستحقيها بجميع مناطق ومدن المملكة، لربط المتبرع بالجمعيات والمؤسسات الأهلية والحالات الإنسانية المرخصة.',
    url: 'https://donations.sa/',
    officialEntity: 'وزارة الموارد البشرية والتنمية الاجتماعية',
    supervisingEntity: 'المركز الوطني لتنمية القطاع غير الربحي',
    logoUrl: 'https://donations.sa/favicon.ico',
    categories: ['تبرع عام', 'الزكاة', 'كفالة الأيتام', 'المشاريع الخيرية', 'تفريج الكرب', 'سقيا الماء', 'المرضى والرعاية الصحية'],
    features: [
      'دعم الجمعيات الأهلية الخيرية المعتمدة',
      'فرص التبرع المباشرة للحالات الأشد حاجة',
      'إخراج ودفع الزكاة للمستحقين المعتمدين',
      'رعاية الأيتام وتفريج كرب الأسر المتعففة',
      'مشاريع الإطعام وسقيا الماء والكسوة',
      'إشراف ومتابعة حكومية مباشرة على كل تبرع'
    ],
    verified: true,
    status: 'verified',
    sortOrder: 2,
    verificationDate: '2026-09-13T00:00:00Z',
    notes: 'تم التحقق من الرابط والنطاق الحكومي الرسمي لوزارة الموارد البشرية والتنمية الاجتماعية.',
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
];

let adminBinBazLinks: AdminBinBazLink[] = [
  {
    id: 'bb-home',
    title: 'الموقع الرسمي لسماحة الشيخ الإمام ابن باز رحمه الله',
    description: 'البوابة الرقمية الشاملة لتراث وعلوم وفتاوى سماحة الشيخ عبدالعزيز بن باز رحمه الله، بإشراف مؤسسة عبدالعزيز بن باز الخيرية.',
    url: 'https://binbaz.org.sa/',
    category: 'general',
    categoryLabelAr: 'البوابة الرئيسية',
    verified: true,
    status: 'verified',
    sortOrder: 1,
    highlight: true,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'bb-fatwas',
    title: 'موسوعة الفتاوى الرسمية المعتمدة',
    description: 'أرشيف فقهي شامل يضم آلاف الفتاوى الشرعية المصنفة في العقيدة والعبادات والمعاملات والأحوال الشخصية والآداب والأخلاق.',
    url: 'https://binbaz.org.sa/fatwas',
    category: 'fatwas',
    categoryLabelAr: 'الفتاوى',
    verified: true,
    status: 'verified',
    sortOrder: 2,
    highlight: true,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'bb-nur',
    title: 'فتاوى برنامج نور على الدرب',
    description: 'موسوعة الإجابات والمسائل الفقهية المفرغة والمسموعة من البرنامج الإذاعي الشهير "نور على الدرب" عبر إذاعة القرآن الكريم.',
    url: 'https://binbaz.org.sa/nur',
    category: 'nur',
    categoryLabelAr: 'نور على الدرب',
    verified: true,
    status: 'verified',
    sortOrder: 3,
    highlight: true,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'bb-books',
    title: 'مكتبة المؤلفات والكتب والرسائل',
    description: 'جميع مؤلفات ورسائل وتحقيقات الشيخ الإمام ابن باز رحمه الله، مع إمكانية التصفح المباشر والقراءة والتحميل بصيغ رقمية موثقة.',
    url: 'https://binbaz.org.sa/books',
    category: 'books',
    categoryLabelAr: 'الكتب والمؤلفات',
    verified: true,
    status: 'verified',
    sortOrder: 4,
    highlight: false,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'bb-audios',
    title: 'المكتبة الصوتية والدروس العلمية',
    description: 'تسجيلات صوتية نادرة ودروس ومحاضرات وشروح علمية لكتب العقيدة والحديث والفقه بأعلى جودة صوتية ممكنة.',
    url: 'https://binbaz.org.sa/audios',
    category: 'audios',
    categoryLabelAr: 'الصوتيات والدروس',
    verified: true,
    status: 'verified',
    sortOrder: 5,
    highlight: false,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
  {
    id: 'bb-articles',
    title: 'المقالات والبحوث والردود العلمية',
    description: 'مقالات سماحة الشيخ، والبحوث الشرعية والتوجيهات الإصلاحية المنشورة في المجلات والصحف والمجامع الفقهية.',
    url: 'https://binbaz.org.sa/articles',
    category: 'articles',
    categoryLabelAr: 'المقالات والبحوث',
    verified: true,
    status: 'verified',
    sortOrder: 6,
    highlight: false,
    createdAt: '2026-09-13T00:00:00Z',
    updatedAt: '2026-09-13T00:00:00Z',
  },
];

export function getPublicDonations(): AdminDonationPlatform[] {
  return adminDonationPlatforms.filter((p) => p.status === 'verified');
}

export function getPublicBinBazLinks(): AdminBinBazLink[] {
  return adminBinBazLinks.filter((b) => b.status === 'verified');
}

// ==========================================
// 5. Auth Middleware
// ==========================================
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const token =
    cookies['wasl_admin_session'] ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  const session = verifySession(token);
  if (!session) {
    logAuditEvent('Unauthorized Access Attempt', 'Admin Route: ' + req.originalUrl, undefined, 'warning', 'محاولة وصول بدون جلسة إدارة صالحة', req.ip);
    return res.status(401).json({
      error: 'غير مصرح بالدخول. يرجى تسجيل الدخول كمسؤول.',
      authenticated: false,
    });
  }

  (req as any).adminSession = session;
  next();
}

// ==========================================
// 6. Admin Authentication Endpoints
// ==========================================

// POST /api/admin/login
adminRouter.post('/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { username, password } = req.body || {};

  // Check rate limit
  const rateStatus = checkRateLimit(clientIp);
  if (!rateStatus.allowed) {
    logAuditEvent('Admin Login Blocked', 'Auth', username, 'warning', `حظر محاولة بسبب تجاوز الحد المسموح. تبقى ${rateStatus.remainingSeconds} ثانية`, clientIp);
    return res.status(429).json({
      error: `تم تعليق المحاولات مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار لمدة ${rateStatus.remainingSeconds} ثانية.`,
      locked: true,
      remainingSeconds: rateStatus.remainingSeconds,
    });
  }

  // Artificial jitter delay to prevent timing attacks
  await new Promise((resolve) => setTimeout(resolve, 350));

  const expectedUsername = (process.env.ADMIN_USERNAME || 'alshbili').trim().toLowerCase();
  const expectedPassword = (process.env.ADMIN_PASSWORD || '').trim();

  const submittedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const submittedPassword = typeof password === 'string' ? password.trim() : '';

  // Constant-time comparison for security
  let isValid = false;
  if (
    submittedUsername &&
    submittedPassword &&
    expectedPassword &&
    submittedUsername === expectedUsername
  ) {
    try {
      const subBuf = Buffer.from(submittedPassword, 'utf-8');
      const expBuf = Buffer.from(expectedPassword, 'utf-8');
      if (subBuf.length === expBuf.length && crypto.timingSafeEqual(subBuf, expBuf)) {
        isValid = true;
      }
    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    recordFailedAttempt(clientIp);
    logAuditEvent('Admin Login Failed', 'Auth', submittedUsername || 'unknown', 'failed', 'محاولة تسجيل دخول ببيانات خاطئة', clientIp);
    return res.status(401).json({
      error: 'بيانات الدخول غير صحيحة',
      authenticated: false,
    });
  }

  // Success: Clear failed attempts and establish server session
  resetFailedAttempts(clientIp);
  const sessionToken = createSession(expectedUsername);

  // Set secure HttpOnly cookie
  const isProd = process.env.NODE_ENV === 'production';
  const cookieFlags = [
    `wasl_admin_session=${sessionToken}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=86400`,
  ];
  if (isProd) {
    cookieFlags.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieFlags.join('; '));

  logAuditEvent('Admin Login Success', 'Auth', expectedUsername, 'success', 'تم تسجيل دخول المسؤول بنجاح وإنشاء جلسة آمنة', clientIp);

  return res.json({
    ok: true,
    authenticated: true,
    username: expectedUsername,
    message: 'تم تسجيل الدخول بنجاح',
  });
});

// POST /api/admin/logout
adminRouter.post('/logout', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['wasl_admin_session'];

  revokeSession(token);

  // Clear cookie
  res.setHeader(
    'Set-Cookie',
    'wasl_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );

  logAuditEvent('Admin Logout', 'Auth', undefined, 'success', 'تم تسجيل خروج المسؤول وإبطال الجلسة', req.ip);

  return res.json({
    ok: true,
    authenticated: false,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

// GET /api/admin/me
adminRouter.get('/me', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const token =
    cookies['wasl_admin_session'] ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    username: session.username,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  });
});

// ==========================================
// 7. Protected Admin Resources (requireAdminAuth)
// ==========================================
adminRouter.use(requireAdminAuth);

// GET /api/admin/stats
adminRouter.get('/stats', (req: Request, res: Response) => {
  const totalContent = adminContents.length;
  const publishedContent = adminContents.filter((c) => c.status === 'published').length;
  const needsReviewContent = adminContents.filter((c) => c.status === 'needs_review' || c.verification === 'needs_review').length;
  const verifiedContent = adminContents.filter((c) => c.verification === 'verified').length;
  const totalSections = adminSections.length;
  const activeSections = adminSections.filter((s) => s.isActive).length;

  const typeCounts = {
    hadith: adminContents.filter((c) => c.contentType === 'حديث').length,
    dhikr: adminContents.filter((c) => c.contentType === 'ذكر').length,
    dua: adminContents.filter((c) => c.contentType === 'دعاء').length,
    quran: adminContents.filter((c) => c.contentType === 'آية').length,
    fatwa: adminContents.filter((c) => c.contentType === 'فتوى' || c.contentType === 'مقال').length,
  };

  res.json({
    counts: {
      totalContent,
      publishedContent,
      needsReviewContent,
      verifiedContent,
      totalSections,
      activeSections,
      registeredUsers: 148, // Live or simulated registered profiles
      radioStations: 24,
      ...typeCounts,
    },
    systemHealth: {
      status: 'operational',
      uptimeHours: 72,
      database: 'connected',
      rateLimiter: 'active',
      activeSessions: adminSessions.size,
    },
  });
});

// GET /api/admin/content
adminRouter.get('/content', (req: Request, res: Response) => {
  const { type, status, sectionId, q } = req.query;

  let filtered = [...adminContents];

  if (typeof type === 'string' && type) {
    filtered = filtered.filter((c) => c.contentType === type || c.contentType.includes(type));
  }

  if (typeof status === 'string' && status) {
    filtered = filtered.filter((c) => c.status === status || c.verification === status);
  }

  if (typeof sectionId === 'string' && sectionId) {
    filtered = filtered.filter((c) => c.sectionId === sectionId);
  }

  if (typeof q === 'string' && q.trim()) {
    const search = q.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.text.toLowerCase().includes(search) ||
        c.source.toLowerCase().includes(search) ||
        (c.title && c.title.toLowerCase().includes(search)) ||
        c.sectionName.toLowerCase().includes(search)
    );
  }

  res.json({ items: filtered, total: filtered.length });
});

// POST /api/admin/content
adminRouter.post('/content', (req: Request, res: Response) => {
  const { sectionId, text, source, contentType, title, narrator, status, verification } = req.body || {};

  if (!text || !source || !contentType) {
    return res.status(400).json({ error: 'النص والمصدر ونوع المحتوى حقول مطلوبة' });
  }

  // Find linked section to auto-bind section name
  const linkedSection = adminSections.find((s) => s.id === sectionId);
  const sectionName = linkedSection ? linkedSection.name : 'القسم العام';

  const newItem: AdminContentItem = {
    id: 'cnt-' + Date.now(),
    sectionId: sectionId || 'sec-1',
    sectionName,
    contentType,
    title: title?.trim() || undefined,
    text: text.trim(),
    source: source.trim(),
    narrator: narrator?.trim() || undefined,
    status: status || 'published',
    verification: verification || 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  adminContents.unshift(newItem);

  // Update section item count
  if (linkedSection) {
    linkedSection.itemCount += 1;
  }

  logAuditEvent('Create Content', 'Content', newItem.id, 'success', `إضافة ${contentType}: ${title || text.slice(0, 30)}`, req.ip);

  res.status(201).json({ ok: true, item: newItem });
});

// PUT /api/admin/content/:id
adminRouter.put('/content/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminContents.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'المحتوى غير موجود' });
  }

  const existing = adminContents[index];
  const { text, source, title, narrator, status, verification, sectionId } = req.body || {};

  let sectionName = existing.sectionName;
  if (sectionId && sectionId !== existing.sectionId) {
    const sec = adminSections.find((s) => s.id === sectionId);
    if (sec) sectionName = sec.name;
  }

  adminContents[index] = {
    ...existing,
    text: text !== undefined ? text.trim() : existing.text,
    source: source !== undefined ? source.trim() : existing.source,
    title: title !== undefined ? title?.trim() : existing.title,
    narrator: narrator !== undefined ? narrator?.trim() : existing.narrator,
    status: status || existing.status,
    verification: verification || existing.verification,
    sectionId: sectionId || existing.sectionId,
    sectionName,
    updatedAt: new Date().toISOString(),
  };

  logAuditEvent('Update Content', 'Content', id, 'success', `تعديل المحتوى ID ${id}`, req.ip);

  res.json({ ok: true, item: adminContents[index] });
});

// DELETE /api/admin/content/:id
adminRouter.delete('/content/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminContents.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'المحتوى غير موجود' });
  }

  const deleted = adminContents.splice(index, 1)[0];
  logAuditEvent('Delete Content', 'Content', id, 'warning', `حذف المحتوى: ${deleted.title || deleted.text.slice(0, 25)}`, req.ip);

  res.json({ ok: true, id });
});

// GET /api/admin/sections
adminRouter.get('/sections', (req: Request, res: Response) => {
  res.json({
    sections: adminSections.sort((a, b) => a.order - b.order),
    total: adminSections.length,
  });
});

// POST /api/admin/sections
adminRouter.post('/sections', (req: Request, res: Response) => {
  const { name, type, order, isActive } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'اسم القسم مطلوب' });
  }

  const newSection: AdminSectionItem = {
    id: 'sec-' + Date.now(),
    name: name.trim(),
    type: type || 'dhikr',
    order: typeof order === 'number' ? order : adminSections.length + 1,
    isActive: isActive !== false,
    itemCount: 0,
  };

  adminSections.push(newSection);
  logAuditEvent('Create Section', 'Section', newSection.id, 'success', `إنشاء قسم جديد: ${newSection.name}`, req.ip);

  res.status(201).json({ ok: true, section: newSection });
});

// PUT /api/admin/sections/:id
adminRouter.put('/sections/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const section = adminSections.find((s) => s.id === id);

  if (!section) {
    return res.status(404).json({ error: 'القسم غير موجود' });
  }

  const { name, type, order, isActive } = req.body || {};
  if (name) section.name = name.trim();
  if (type) section.type = type;
  if (typeof order === 'number') section.order = order;
  if (typeof isActive === 'boolean') section.isActive = isActive;

  // Update associated content section names if name changed
  if (name) {
    adminContents.forEach((c) => {
      if (c.sectionId === id) c.sectionName = section.name;
    });
  }

  logAuditEvent('Update Section', 'Section', id, 'success', `تعديل قسم: ${section.name}`, req.ip);

  res.json({ ok: true, section });
});

// DELETE /api/admin/sections/:id
adminRouter.delete('/sections/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminSections.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'القسم غير موجود' });
  }

  const deleted = adminSections.splice(index, 1)[0];
  logAuditEvent('Delete Section', 'Section', id, 'warning', `حذف قسم: ${deleted.name}`, req.ip);

  res.json({ ok: true, id });
});

// GET /api/admin/users
adminRouter.get('/users', (req: Request, res: Response) => {
  // Safe sanitized user accounts list for inspection only (no passwords or sensitive tokens)
  const users = [
    { id: 'usr-1', email: 'abdullah.ahmed@example.com', fullName: 'عبدالله أحمد', role: 'user', joinedAt: '2026-08-15', bookmarksCount: 14, readingStreak: 12 },
    { id: 'usr-2', email: 'fatima.zahra@example.com', fullName: 'فاطمة الزهراء', role: 'user', joinedAt: '2026-08-20', bookmarksCount: 22, readingStreak: 25 },
    { id: 'usr-3', email: 'omar.khalid@example.com', fullName: 'عمر خالد', role: 'user', joinedAt: '2026-09-01', bookmarksCount: 7, readingStreak: 5 },
    { id: 'usr-4', email: 'mariam.saleh@example.com', fullName: 'مريم صالح', role: 'user', joinedAt: '2026-09-05', bookmarksCount: 31, readingStreak: 19 },
    { id: 'usr-5', email: 'yousef.ibrahim@example.com', fullName: 'يوسف إبراهيم', role: 'user', joinedAt: '2026-09-10', bookmarksCount: 4, readingStreak: 3 },
  ];

  res.json({ users, total: users.length });
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: auditLogs.slice(0, 100), total: auditLogs.length });
});

// ==========================================
// 8. Donation Platforms Admin Endpoints
// ==========================================

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy'];

function sanitizeInput(str?: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// GET /api/admin/donations
adminRouter.get('/donations', (req: Request, res: Response) => {
  res.json({ platforms: adminDonationPlatforms, total: adminDonationPlatforms.length });
});

// POST /api/admin/donations
adminRouter.post('/donations', (req: Request, res: Response) => {
  const { name, description, url, officialEntity, supervisingEntity, logoUrl, categories, features, status, sortOrder, notes } = req.body || {};

  if (!name || !url || !officialEntity || !supervisingEntity) {
    return res.status(400).json({ error: 'الاسم، الرابط، الجهة الرسمية، والجهة المشرفة حقول إلزامية' });
  }

  const cleanUrl = url.trim();
  if (!cleanUrl.toLowerCase().startsWith('https://')) {
    return res.status(400).json({ error: 'يجب أن يبدأ الرابط ببروتوكول التشفير الآمن HTTPS' });
  }

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();
    if (SHORTENERS.some((s) => host === s || host.endsWith('.' + s))) {
      return res.status(400).json({ error: 'غير مسموح باستخدام روابط مختصرة لضمان أمان المتبرعين' });
    }
  } catch {
    return res.status(400).json({ error: 'صيغة الرابط غير صحيحة' });
  }

  const newPlatform: AdminDonationPlatform = {
    id: 'plat-' + Date.now(),
    name: sanitizeInput(name),
    description: sanitizeInput(description),
    url: cleanUrl,
    officialEntity: sanitizeInput(officialEntity),
    supervisingEntity: sanitizeInput(supervisingEntity),
    logoUrl: logoUrl ? logoUrl.trim() : undefined,
    categories: Array.isArray(categories) ? categories.map((c: string) => sanitizeInput(c)) : ['تبرع عام'],
    features: Array.isArray(features) ? features.map((f: string) => sanitizeInput(f)) : [],
    verified: status === 'verified',
    status: status || 'verified',
    sortOrder: typeof sortOrder === 'number' ? sortOrder : adminDonationPlatforms.length + 1,
    verificationDate: new Date().toISOString(),
    notes: sanitizeInput(notes),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  adminDonationPlatforms.push(newPlatform);
  logAuditEvent('Create Donation Platform', 'DonationPlatform', newPlatform.id, 'success', `إضافة منصة تبرع جديدة: ${newPlatform.name}`, req.ip);

  res.status(201).json({ ok: true, platform: newPlatform });
});

// PUT /api/admin/donations/:id
adminRouter.put('/donations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const platform = adminDonationPlatforms.find((p) => p.id === id);

  if (!platform) {
    return res.status(404).json({ error: 'منصة التبرع غير موجودة' });
  }

  const { name, description, url, officialEntity, supervisingEntity, logoUrl, categories, features, status, sortOrder, notes } = req.body || {};

  if (url) {
    const cleanUrl = url.trim();
    if (!cleanUrl.toLowerCase().startsWith('https://')) {
      return res.status(400).json({ error: 'يجب أن يبدأ الرابط ببروتوكول HTTPS' });
    }
    try {
      const parsed = new URL(cleanUrl);
      const host = parsed.hostname.toLowerCase();
      if (SHORTENERS.some((s) => host === s || host.endsWith('.' + s))) {
        return res.status(400).json({ error: 'غير مسموح بالروابط المختصرة' });
      }
      platform.url = cleanUrl;
    } catch {
      return res.status(400).json({ error: 'صيغة الرابط غير صحيحة' });
    }
  }

  if (name) platform.name = sanitizeInput(name);
  if (description !== undefined) platform.description = sanitizeInput(description);
  if (officialEntity) platform.officialEntity = sanitizeInput(officialEntity);
  if (supervisingEntity) platform.supervisingEntity = sanitizeInput(supervisingEntity);
  if (logoUrl !== undefined) platform.logoUrl = logoUrl ? logoUrl.trim() : undefined;
  if (Array.isArray(categories)) platform.categories = categories.map((c: string) => sanitizeInput(c));
  if (Array.isArray(features)) platform.features = features.map((f: string) => sanitizeInput(f));
  if (status) {
    platform.status = status;
    platform.verified = status === 'verified';
  }
  if (typeof sortOrder === 'number') platform.sortOrder = sortOrder;
  if (notes !== undefined) platform.notes = sanitizeInput(notes);
  platform.updatedAt = new Date().toISOString();

  logAuditEvent('Update Donation Platform', 'DonationPlatform', id, 'success', `تعديل منصة تبرع: ${platform.name}`, req.ip);

  res.json({ ok: true, platform });
});

// DELETE /api/admin/donations/:id
adminRouter.delete('/donations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminDonationPlatforms.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'منصة التبرع غير موجودة' });
  }

  const deleted = adminDonationPlatforms.splice(index, 1)[0];
  logAuditEvent('Delete Donation Platform', 'DonationPlatform', id, 'warning', `حذف منصة تبرع: ${deleted.name}`, req.ip);

  res.json({ ok: true, id });
});

// ==========================================
// 9. Sheikh Ibn Baz Admin Endpoints
// ==========================================

// GET /api/admin/binbaz
adminRouter.get('/binbaz', (req: Request, res: Response) => {
  res.json({ links: adminBinBazLinks, total: adminBinBazLinks.length });
});

// POST /api/admin/binbaz
adminRouter.post('/binbaz', (req: Request, res: Response) => {
  const { title, description, url, category, categoryLabelAr, status, sortOrder, highlight } = req.body || {};

  if (!title || !url || !category) {
    return res.status(400).json({ error: 'العنوان والرابط والتصنيف حقول إلزامية' });
  }

  const cleanUrl = url.trim();
  if (!cleanUrl.toLowerCase().startsWith('https://')) {
    return res.status(400).json({ error: 'يجب أن يبدأ الرابط بـ HTTPS' });
  }

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();
    if (host !== 'binbaz.org.sa' && host !== 'www.binbaz.org.sa') {
      return res.status(400).json({ error: 'المصدر المعتمد الوحيد هو نطاق binbaz.org.sa' });
    }
  } catch {
    return res.status(400).json({ error: 'صيغة الرابط غير صحيحة' });
  }

  const newLink: AdminBinBazLink = {
    id: 'bb-' + Date.now(),
    title: sanitizeInput(title),
    description: sanitizeInput(description),
    url: cleanUrl,
    category: category || 'general',
    categoryLabelAr: sanitizeInput(categoryLabelAr) || 'قسم رسمي',
    verified: status !== 'inactive',
    status: status || 'verified',
    sortOrder: typeof sortOrder === 'number' ? sortOrder : adminBinBazLinks.length + 1,
    highlight: Boolean(highlight),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  adminBinBazLinks.push(newLink);
  logAuditEvent('Create Ibn Baz Link', 'BinBazLink', newLink.id, 'success', `إضافة رابط لقسم ابن باز: ${newLink.title}`, req.ip);

  res.status(201).json({ ok: true, link: newLink });
});

// PUT /api/admin/binbaz/:id
adminRouter.put('/binbaz/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const link = adminBinBazLinks.find((l) => l.id === id);

  if (!link) {
    return res.status(404).json({ error: 'الرابط غير موجود' });
  }

  const { title, description, url, category, categoryLabelAr, status, sortOrder, highlight } = req.body || {};

  if (url) {
    const cleanUrl = url.trim();
    if (!cleanUrl.toLowerCase().startsWith('https://')) {
      return res.status(400).json({ error: 'يجب أن يبدأ الرابط بـ HTTPS' });
    }
    try {
      const parsed = new URL(cleanUrl);
      const host = parsed.hostname.toLowerCase();
      if (host !== 'binbaz.org.sa' && host !== 'www.binbaz.org.sa') {
        return res.status(400).json({ error: 'المصدر المعتمد الوحيد هو نطاق binbaz.org.sa' });
      }
      link.url = cleanUrl;
    } catch {
      return res.status(400).json({ error: 'صيغة الرابط غير صحيحة' });
    }
  }

  if (title) link.title = sanitizeInput(title);
  if (description !== undefined) link.description = sanitizeInput(description);
  if (category) link.category = category;
  if (categoryLabelAr) link.categoryLabelAr = sanitizeInput(categoryLabelAr);
  if (status) {
    link.status = status;
    link.verified = status === 'verified';
  }
  if (typeof sortOrder === 'number') link.sortOrder = sortOrder;
  if (highlight !== undefined) link.highlight = Boolean(highlight);
  link.updatedAt = new Date().toISOString();

  logAuditEvent('Update Ibn Baz Link', 'BinBazLink', id, 'success', `تعديل رابط ابن باز: ${link.title}`, req.ip);

  res.json({ ok: true, link });
});

// DELETE /api/admin/binbaz/:id
adminRouter.delete('/binbaz/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminBinBazLinks.findIndex((l) => l.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'الرابط غير موجود' });
  }

  const deleted = adminBinBazLinks.splice(index, 1)[0];
  logAuditEvent('Delete Ibn Baz Link', 'BinBazLink', id, 'warning', `حذف رابط ابن باز: ${deleted.title}`, req.ip);

  res.json({ ok: true, id });
});

// ==========================================
// 12. Daily Wird (إدارة ورد اليوم)
// ==========================================
export interface AdminScheduledWird {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  status: 'published' | 'draft';
  isFriday: boolean;
  isRamadan: boolean;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

let adminScheduledWirds: AdminScheduledWird[] = [];

export function getPublicWirdForDate(dateString: string): AdminScheduledWird | null {
  const match = adminScheduledWirds.find((w) => w.date === dateString && w.status === 'published');
  return match || null;
}

// GET /api/admin/wird
adminRouter.get('/wird', (req: Request, res: Response) => {
  res.json({
    wirds: adminScheduledWirds,
    count: adminScheduledWirds.length,
  });
});

// POST /api/admin/wird
adminRouter.post('/wird', (req: Request, res: Response) => {
  const { id, date, title, subtitle, status, isFriday, isRamadan, items } = req.body || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'صيغة التاريخ غير صحيحة (يجب أن تكون YYYY-MM-DD)' });
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'عنوان ورد اليوم مطلوب' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'يجب أن يحتوي ورد اليوم على عناصر موثقة' });
  }

  // Religious Content Verification Enforcement
  for (const item of items) {
    if (!item.type) {
      return res.status(400).json({ error: 'نوع العنصر مطلوب' });
    }
    if (item.type === 'quran') {
      if (!item.quranData?.surahNumber || item.quranData.surahNumber < 1 || item.quranData.surahNumber > 114) {
        return res.status(400).json({ error: 'رقم سورة القرآن يجب أن يكون بين 1 و 114' });
      }
      if (!item.quranData?.ayahText) {
        return res.status(400).json({ error: 'نص الآيات القرآنية مطلوب ويجب أن يكون موثقاً' });
      }
    } else if (item.type === 'hadith') {
      if (!item.hadithData?.textAr || !item.hadithData?.collectionAr) {
        return res.status(400).json({ error: 'نص وتخريج الحديث النبوي الشريف مطلوب من المصادر المعتمدة' });
      }
    } else if (item.type === 'dhikr') {
      if (!item.dhikrData?.textAr || !item.dhikrData?.sourceAr) {
        return res.status(400).json({ error: 'نص ومصدر الذكر مطلوب' });
      }
    } else if (item.type === 'dua') {
      if (!item.duaData?.textAr || !item.duaData?.sourceAr) {
        return res.status(400).json({ error: 'نص ومصدر الدعاء مطلوب' });
      }
    }
  }

  const existingIndex = adminScheduledWirds.findIndex((w) => w.id === id || w.date === date);
  const now = new Date().toISOString();

  const record: AdminScheduledWird = {
    id: id || `wird-scheduled-${date}`,
    date,
    title: sanitizeInput(title),
    subtitle: sanitizeInput(subtitle || 'خذ من يومك دقائق تقرّبك إلى الله'),
    status: status === 'draft' ? 'draft' : 'published',
    isFriday: Boolean(isFriday),
    isRamadan: Boolean(isRamadan),
    items,
    createdAt: existingIndex >= 0 ? adminScheduledWirds[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    adminScheduledWirds[existingIndex] = record;
    logAuditEvent('Update Daily Wird', 'DailyWird', record.id, 'success', `تعديل ورد اليوم لتاريخ: ${date}`, req.ip);
  } else {
    adminScheduledWirds.unshift(record);
    logAuditEvent('Create Daily Wird', 'DailyWird', record.id, 'success', `إنشاء ورد يومي جديد لتاريخ: ${date}`, req.ip);
  }

  return res.json({ ok: true, wird: record });
});

// DELETE /api/admin/wird/:id
adminRouter.delete('/wird/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = adminScheduledWirds.findIndex((w) => w.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'الورد غير موجود' });
  }

  const deleted = adminScheduledWirds.splice(index, 1)[0];
  logAuditEvent('Delete Daily Wird', 'DailyWird', id, 'warning', `حذف ورد اليوم لتاريخ: ${deleted.date}`, req.ip);

  res.json({ ok: true, id });
});


