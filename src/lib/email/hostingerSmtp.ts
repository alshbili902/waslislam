import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
  siteUrl: string;
  adminEmail?: string;
}

export interface SmtpDiagnosticInfo {
  isConfigured: boolean;
  host: string;
  port: number;
  secure: boolean;
  userConfigured: boolean;
  userEmail: string;
  fromAddress: string;
  siteUrl: string;
  hasAdminEmail: boolean;
  missingKeys: string[];
}

/**
 * Reads server-side SMTP configuration for Hostinger email delivery.
 * All secrets remain strictly on the server.
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  // Default to secure: true for port 465, false for port 587
  const secureEnv = process.env.SMTP_SECURE;
  const secure = secureEnv !== undefined ? secureEnv === 'true' : port === 465;

  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
  const fromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || 'منصة وصل الإسلامية';
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.MAIL_FROM_ADDRESS || user || 'noreply@wasal.fun';
  const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://waslislam.fun').replace(/\/$/, '');
  const adminEmail = process.env.NOTIFICATION_ADMIN_EMAIL || undefined;

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromAddress,
    siteUrl,
    adminEmail
  };
}

/**
 * Evaluates SMTP configuration completeness without leaking secrets.
 */
export function getSmtpDiagnostics(): SmtpDiagnosticInfo {
  const cfg = getSmtpConfig();
  const missingKeys: string[] = [];

  if (!cfg.host) missingKeys.push('SMTP_HOST');
  if (!cfg.user) missingKeys.push('SMTP_USER');
  if (!cfg.pass) missingKeys.push('SMTP_PASS');

  return {
    isConfigured: missingKeys.length === 0,
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    userConfigured: !!cfg.user,
    userEmail: cfg.user ? cfg.user.replace(/(?<=.).(?=.*@)/g, '*') : 'NOT_SET',
    fromAddress: cfg.fromAddress,
    siteUrl: cfg.siteUrl,
    hasAdminEmail: !!cfg.adminEmail,
    missingKeys
  };
}

// Global cached transporter for connection pooling
let cachedTransporter: Transporter | null = null;
let lastTransporterConfigKey = '';

/**
 * Creates or retrieves the cached Nodemailer transporter with Hostinger-optimized options.
 */
export function getHostingerTransporter(): Transporter {
  const cfg = getSmtpConfig();
  const configKey = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.secure}`;

  if (cachedTransporter && lastTransporterConfigKey === configKey) {
    return cachedTransporter;
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass
    },
    // Hostinger connection timeouts and pooling settings
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,     // 15 seconds
    tls: {
      // Hostinger SSL certificate verification
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });

  cachedTransporter = transporter;
  lastTransporterConfigKey = configKey;
  return transporter;
}

/**
 * Performs a safe SMTP connection check without exposing credentials.
 */
export async function verifySmtpConnection(): Promise<{
  success: boolean;
  message: string;
  diagnostics: SmtpDiagnosticInfo;
}> {
  const diagnostics = getSmtpDiagnostics();
  if (!diagnostics.isConfigured) {
    return {
      success: false,
      message: `بيانات خادم Hostinger SMTP غير مكتملة: المتغيرات الناقصة (${diagnostics.missingKeys.join(', ')})`,
      diagnostics
    };
  }

  try {
    const transporter = getHostingerTransporter();
    await transporter.verify();
    return {
      success: true,
      message: `تم الاتصال بنجاح بخادم Hostinger SMTP (${diagnostics.host}:${diagnostics.port})`,
      diagnostics
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // Sanitize any potential leaked password in error text
    const sanitized = errorMsg.replace(/(auth|pass|password)[:=]\s*\S+/gi, '$1=***');
    return {
      success: false,
      message: `تعذر الاتصال بخادم Hostinger SMTP: ${sanitized}`,
      diagnostics
    };
  }
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

/**
 * Delivers an email message through Hostinger SMTP.
 * Never reports success if the message was not genuinely accepted by the SMTP server.
 */
export async function sendHostingerEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const cfg = getSmtpConfig();

  if (!cfg.user || !cfg.pass) {
    return {
      success: false,
      error: 'لم يتم تكوين بيانات اعتماد بريد Hostinger في الخادم (SMTP_USER / SMTP_PASS).'
    };
  }

  try {
    const transporter = getHostingerTransporter();

    const info = await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || cfg.fromAddress,
      headers: {
        'X-Application': 'Wasl-Islamic-Platform',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk'
      }
    });

    const accepted = Array.isArray(info.accepted) ? (info.accepted as string[]) : [];
    const rejected = Array.isArray(info.rejected) ? (info.rejected as string[]) : [];

    if (accepted.length === 0 && rejected.length > 0) {
      return {
        success: false,
        error: `تم رفض استلام الرسالة للعنوان: ${rejected.join(', ')}`,
        rejected
      };
    }

    return {
      success: true,
      messageId: info.messageId,
      accepted,
      rejected
    };
  } catch (err: unknown) {
    const error = err as Record<string, unknown> & Error;
    let message = error.message || 'خطأ غير معروف في خادم البريد.';

    // Classify error without exposing credentials
    if (error.responseCode === 535 || message.includes('535') || message.includes('authentication')) {
      message = 'فشل التحقق من كلمة مرور أو بيانات اعتماد صندوق بريد Hostinger (535 Authentication failed).';
    } else if (error.responseCode === 421 || error.responseCode === 450) {
      message = 'تجاوز معدل الإرسال المسموح به من Hostinger، يرجى المحاولة لاحقاً (Rate limit).';
    } else if (error.responseCode === 550 || error.responseCode === 553) {
      message = `تم رفض عنوان المستلم من قِبل الخادم (${options.to}).`;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      message = `انتهت مهلة الاتصال بخادم Hostinger SMTP (${cfg.host}:${cfg.port}).`;
    }

    // Ensure passwords are never present in error logs
    message = message.replace(/(auth|pass|password)[:=]\s*\S+/gi, '$1=***');

    return {
      success: false,
      error: message
    };
  }
}
