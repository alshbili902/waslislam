/**
 * Wasl Islamic (منصة وصل الإسلامية) - Production Email Templates
 * Arabic RTL responsive HTML & Plain Text templates.
 */

interface BaseTemplateParams {
  siteUrl: string;
}

export interface OtpVerificationEmailParams extends BaseTemplateParams {
  otp: string;
  expiresMinutes?: number;
  categoriesLabels?: string[];
}

export type ConfirmSubscriptionParams = OtpVerificationEmailParams;

export interface DailyIslamicParams extends BaseTemplateParams {
  dateFormatted: string;
  hijriFormatted: string;
  ayah: {
    surahNameAr: string;
    surahNumber: number;
    ayahNumber: number;
    textAr: string;
    surahUrl: string;
  };
  hadith: {
    textAr: string;
    sourceAr: string;
    narratorAr?: string;
  };
  dhikr: {
    titleAr: string;
    textAr: string;
    virtueAr?: string;
  };
  manageUrl: string;
  unsubscribeUrl: string;
}

export interface PreferencesUpdatedParams extends BaseTemplateParams {
  categoriesLabels: string[];
  manageUrl: string;
  unsubscribeUrl: string;
}

export interface UnsubscribeConfirmationParams extends BaseTemplateParams {
  resubscribeUrl: string;
}

export interface AdminAlertParams extends BaseTemplateParams {
  alertType: string;
  summary: string;
  details: string;
  timestamp: string;
  affectedCount?: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Common HTML wrapper with Wasl Islamic branding, RTL styling, and mobile responsiveness
 */
function wrapHtmlEmail(title: string, bodyContent: string, footerLinks: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    /* Reset & Client-specific Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji'; direction: rtl; text-align: right; }
    
    /* Layout */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
    .main-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 50%, #b45309 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .header p { margin: 6px 0 0; color: #fef3c7; font-size: 13px; font-weight: 500; }
    .content-body { padding: 32px 24px; color: #1e293b; font-size: 15px; line-height: 1.8; }
    .card-block { background-color: #f8fafc; border: 1px solid #e2e8f0; border-right: 4px solid #065f46; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #065f46; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 16px 0; }
    .btn:hover { background-color: #047857; }
    .gold-badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.7; }
    .footer a { color: #065f46; text-decoration: underline; }
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; border-radius: 0 !important; }
      .content-body { padding: 24px 16px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header Spacing -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 12px 12px;">
          <table role="presentation" class="main-table" cellpadding="0" cellspacing="0">
            <!-- Brand Header -->
            <tr>
              <td class="header">
                <h1>منصة وصل الإسلامية</h1>
                <p>محتوى إسلامي موثوق • قرآن كريم وأذكار وأوقات الصلاة</p>
              </td>
            </tr>

            <!-- Main Content Area -->
            <tr>
              <td class="content-body">
                ${bodyContent}
              </td>
            </tr>

            <!-- Footer Area -->
            <tr>
              <td class="footer" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 8px;">
                  وصلتك هذه الرسالة بناءً على طلبك من منصة <a href="${siteUrl}" target="_blank">وصل الإسلامية</a>.
                </p>
                <div style="margin: 12px 0;">
                  ${footerLinks}
                </div>
                <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">
                  &copy; ${new Date().getFullYear()} منصة وصل الإسلامية • جميع الحقوق محفوظة
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * 1. OTP Verification Email (بدون روابط تفعيل — رمز تحقق مكون من 6 أرقام)
 */
export function renderOtpVerificationEmail(params: OtpVerificationEmailParams): RenderedEmail {
  const subject = 'رمز التحقق من بريدك الإلكتروني — منصة وصل الإسلامية';
  const expiresMinutes = params.expiresMinutes || 10;
  const siteUrl = params.siteUrl || 'https://waslislam.fun';

  const categoriesHtml = params.categoriesLabels && params.categoriesLabels.length > 0
    ? params.categoriesLabels.map(c => `<li style="margin-bottom: 6px;">${c}</li>`).join('')
    : '';

  const bodyContent = `
    <h2 style="color: #065f46; font-size: 20px; margin-top: 0; font-weight: 800;">السلام عليكم ورحمة الله وبركاته</h2>
    <p style="margin: 0 0 14px; font-size: 15px; color: #1e293b;">
      مرحبًا بك في <strong>منصة وصل الإسلامية</strong>.
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; color: #334155;">
      استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني وتفعيل الإشعارات البريدية:
    </p>

    <!-- Prominent OTP Code Container -->
    <div style="text-align: center; margin: 28px 0; padding: 24px 16px; background-color: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0;">
      <div style="display: inline-block; background-color: #ffffff; border: 2px solid #b45309; border-radius: 14px; padding: 14px 28px; box-shadow: 0 4px 14px rgba(6, 95, 70, 0.08);">
        <span style="font-family: 'Courier New', Courier, monospace, 'Segoe UI', sans-serif; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #065f46; display: block; margin-right: -10px; direction: ltr;">
          ${params.otp || '------'}
        </span>
      </div>
      <p style="margin: 14px 0 0; font-size: 13px; font-weight: 700; color: #92400e;">
        تنتهي صلاحية الرمز خلال ${expiresMinutes} دقائق.
      </p>
    </div>

    ${categoriesHtml ? `
    <div class="card-block">
      <span class="gold-badge">التفضيلات المختارة</span>
      <ul style="margin: 10px 0 0; padding-right: 20px; color: #334155;">
        ${categoriesHtml}
      </ul>
    </div>
    ` : ''}

    <p style="font-size: 13px; color: #64748b; line-height: 1.8; margin: 20px 0 0;">
      إذا لم تطلب هذا الرمز، فتجاهل الرسالة ولن يتم تفعيل أي إشعارات على بريدك.<br>
      <span style="color: #94a3b8; font-size: 12px;">منصة وصل الإسلامية — waslislam.fun</span>
    </p>
  `;

  const footerLinks = `
    <a href="${siteUrl}" target="_blank">زيارة المنصة الرئيسية</a>
  `;

  const text = `مرحبًا بك في منصة وصل الإسلامية.

استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني وتفعيل الإشعارات البريدية:

[ ${params.otp || '------'} ]

تنتهي صلاحية الرمز خلال ${expiresMinutes} دقائق.

إذا لم تطلب هذا الرمز، فتجاهل الرسالة.

منصة وصل الإسلامية — waslislam.fun`;

  return {
    subject,
    html: wrapHtmlEmail(subject, bodyContent, footerLinks, siteUrl),
    text
  };
}

export const renderConfirmSubscriptionEmail = renderOtpVerificationEmail;

/**
 * 2. Daily Islamic Notification Email
 */
export function renderDailyIslamicEmail(params: DailyIslamicParams): RenderedEmail {
  const subject = `وصل الإسلامية • رسالتك الإيمانية ليوم ${params.dateFormatted}`;

  const bodyContent = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
      <span class="gold-badge">${params.hijriFormatted}</span>
      <span style="font-size: 12px; color: #64748b;">${params.dateFormatted}</span>
    </div>

    <h2 style="color: #065f46; font-size: 20px; margin-top: 0;">السلام عليكم ورحمة الله وبركاته</h2>
    <p style="color: #475569; margin-top: 4px;">
      نسأل الله تعالى أن يجعله يومًا مباركًا عامرًا بطاعته وذكره. إليك نفحات إيمانية مختارة من القرآن والسنة:
    </p>

    <!-- 1. Quranic Ayah -->
    <div class="card-block" style="border-right-color: #065f46; background-color: #f0fdf4;">
      <div style="margin-bottom: 8px;">
        <span class="gold-badge" style="background-color: #065f46; color: #ffffff;">آية وتدبر</span>
        <strong style="color: #065f46; margin-right: 8px; font-size: 13px;">
          سورة ${params.ayah.surahNameAr} [آية ${params.ayah.ayahNumber}]
        </strong>
      </div>
      <p style="font-size: 17px; font-weight: 700; color: #0f172a; line-height: 2; margin: 12px 0;">
        «${params.ayah.textAr}»
      </p>
      <div style="text-align: left; margin-top: 8px;">
        <a href="${params.ayah.surahUrl}" target="_blank" style="font-size: 12px; color: #047857; text-decoration: none; font-weight: 700;">
          استمع للآية وتدبرها في المصحف &larr;
        </a>
      </div>
    </div>

    <!-- 2. Authentic Hadith -->
    <div class="card-block" style="border-right-color: #d97706; background-color: #fffbeb;">
      <div style="margin-bottom: 8px;">
        <span class="gold-badge">حديث نبوي شريف</span>
        <strong style="color: #92400e; margin-right: 8px; font-size: 13px;">
          ${params.hadith.sourceAr} ${params.hadith.narratorAr ? `• عن ${params.hadith.narratorAr}` : ''}
        </strong>
      </div>
      <p style="font-size: 15px; color: #334155; line-height: 1.9; margin: 12px 0;">
        «${params.hadith.textAr}»
      </p>
    </div>

    <!-- 3. Dhikr or Dua -->
    <div class="card-block" style="border-right-color: #3b82f6; background-color: #eff6ff;">
      <div style="margin-bottom: 8px;">
        <span class="gold-badge" style="background-color: #dbeafe; color: #1e40af;">ذكر ودعاء</span>
        <strong style="color: #1e40af; margin-right: 8px; font-size: 13px;">
          ${params.dhikr.titleAr}
        </strong>
      </div>
      <p style="font-size: 16px; font-weight: 600; color: #1e3a8a; line-height: 1.8; margin: 10px 0;">
        ${params.dhikr.textAr}
      </p>
      ${params.dhikr.virtueAr ? `<p style="font-size: 12px; color: #475569; margin: 6px 0 0;"><strong>الفضل:</strong> ${params.dhikr.virtueAr}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 28px 0 10px;">
      <a href="${params.siteUrl}" class="btn" target="_blank">
        تصفح المصحف وأذكار اليوم على وصل
      </a>
    </div>
  `;

  const footerLinks = `
    <a href="${params.manageUrl}" target="_blank">تعديل التفضيلات</a> &nbsp;|&nbsp;
    <a href="${params.unsubscribeUrl}" target="_blank">إلغاء الاشتراك</a> &nbsp;|&nbsp;
    <a href="${params.siteUrl}" target="_blank">منصة وصل الإسلامية</a>
  `;

  const text = `وصل الإسلامية • رسالتك الإيمانية ليوم ${params.dateFormatted} (${params.hijriFormatted})

السلام عليكم ورحمة الله وبركاته،

[آية وتدبر]
سورة ${params.ayah.surahNameAr} [آية ${params.ayah.ayahNumber}]:
«${params.ayah.textAr}»
قراءة الآية في المصحف: ${params.ayah.surahUrl}

[حديث نبوي شريف]
${params.hadith.sourceAr}:
«${params.hadith.textAr}»

[ذكر ودعاء]
${params.dhikr.titleAr}:
${params.dhikr.textAr}
${params.dhikr.virtueAr ? `الفضل: ${params.dhikr.virtueAr}` : ''}

تعديل التفضيلات: ${params.manageUrl}
إلغاء الاشتراك: ${params.unsubscribeUrl}
منصة وصل الإسلامية: ${params.siteUrl}`;

  return {
    subject,
    html: wrapHtmlEmail(subject, bodyContent, footerLinks, params.siteUrl),
    text
  };
}

/**
 * 3. Notification Preferences Updated Email
 */
export function renderPreferencesUpdatedEmail(params: PreferencesUpdatedParams): RenderedEmail {
  const subject = 'تم تحديث تفضيلات الإشعارات البريدية • وصل الإسلامية';

  const categoriesHtml = params.categoriesLabels
    .map(c => `<li>${c}</li>`)
    .join('');

  const bodyContent = `
    <h2 style="color: #065f46; font-size: 20px; margin-top: 0;">تم حفظ تفضيلاتك بنجاح</h2>
    <p>
      تم تحديث أقسام الإشعارات البريدية التي ترغب في استلامها عبر بريدك الإلكتروني:
    </p>

    <div class="card-block">
      <span class="gold-badge">أقسامك المفعلة حاليًا</span>
      <ul style="margin: 10px 0 0; padding-right: 20px; color: #334155;">
        ${categoriesHtml}
      </ul>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      يمكنك تعديل هذه الاختيارات أو إلغاء الاشتراك في أي وقت دون الحاجة لكلمة مرور.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.manageUrl}" class="btn" target="_blank">
        إدارة التفضيلات
      </a>
    </div>
  `;

  const footerLinks = `
    <a href="${params.manageUrl}" target="_blank">إدارة التفضيلات</a> &nbsp;|&nbsp;
    <a href="${params.unsubscribeUrl}" target="_blank">إلغاء الاشتراك</a>
  `;

  const text = `تم تحديث تفضيلات الإشعارات البريدية بنجاح.
الأقسام المفعلة:
${params.categoriesLabels.join(', ')}

لإدارة تفضيلاتك: ${params.manageUrl}
لإلغاء الاشتراك: ${params.unsubscribeUrl}`;

  return {
    subject,
    html: wrapHtmlEmail(subject, bodyContent, footerLinks, params.siteUrl),
    text
  };
}

/**
 * 4. Unsubscribe Confirmation Email
 */
export function renderUnsubscribeConfirmationEmail(params: UnsubscribeConfirmationParams): RenderedEmail {
  const subject = 'تم إلغاء الاشتراك في إشعارات وصل الإسلامية';

  const bodyContent = `
    <h2 style="color: #065f46; font-size: 20px; margin-top: 0;">تم إلغاء اشتراكك بنجاح</h2>
    <p>
      تم إيقاف إرسال الإشعارات البريدية إلى عنوان بريدك الإلكتروني بالكامل. نرجو أن تكون تجربتك مع منصة وصل الإسلامية مفيدة ونافعة.
    </p>

    <div class="card-block" style="border-right-color: #64748b;">
      <p style="margin: 0; color: #475569; font-size: 13px;">
        إذا قمت بإلغاء الاشتراك بالخطأ، يمكنك إعادة تفعيله في أي وقت بزيارة المنصة أو الضغط أدناه:
      </p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.resubscribeUrl}" class="btn" target="_blank">
        العودة لمنصة وصل الإسلامية
      </a>
    </div>
  `;

  const footerLinks = `
    <a href="${params.siteUrl}" target="_blank">زيارة منصة وصل الإسلامية</a>
  `;

  const text = `تم إلغاء اشتراكك في إشعارات وصل الإسلامية بنجاح.
لن يتم إرسال أي رسائل إضافية إلى بريدك.
إذا رغبت في إعادة الاشتراك مستقبلاً، يمكنك زيارة المنصة: ${params.siteUrl}`;

  return {
    subject,
    html: wrapHtmlEmail(subject, bodyContent, footerLinks, params.siteUrl),
    text
  };
}

/**
 * 5. Admin Operational Alert Email
 */
export function renderAdminAlertEmail(params: AdminAlertParams): RenderedEmail {
  const subject = `[تنبيه إداري - وصل الإسلامية] ${params.alertType}`;

  const bodyContent = `
    <h2 style="color: #b91c1c; font-size: 20px; margin-top: 0;">تنبيه عمليات النظام: ${params.alertType}</h2>
    <p style="color: #334155;">
      حدث تنبيه تشغيلي في نظام الإشعارات البريدية يستدعي المراجعة:
    </p>

    <div class="card-block" style="border-right-color: #dc2626; background-color: #fef2f2;">
      <strong style="color: #991b1b; display: block; margin-bottom: 6px;">ملخص التنبيه:</strong>
      <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 14px;">${params.summary}</p>
      ${params.affectedCount !== undefined ? `<p style="margin: 0 0 6px; font-size: 13px; color: #7f1d1d;"><strong>العدد المتأثر:</strong> ${params.affectedCount}</p>` : ''}
      <p style="margin: 0; font-size: 12px; color: #991b1b;"><strong>التوقيت:</strong> ${params.timestamp}</p>
    </div>

    <div style="background-color: #f1f5f9; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 12px; color: #0f172a; white-space: pre-wrap; direction: ltr; text-align: left; margin: 16px 0;">
${params.details}
    </div>

    <p style="font-size: 12px; color: #64748b;">
      * هذا تنبيه آلي يتم تجميعه لمنع حلقات التكرار (Alert Throttling).
    </p>
  `;

  const footerLinks = `
    <span style="color: #94a3b8;">إشعار عمليات منصة وصل الإسلامية</span>
  `;

  const text = `[تنبيه إداري - وصل الإسلامية] ${params.alertType}
التوقيت: ${params.timestamp}
الملخص: ${params.summary}
${params.affectedCount ? `العدد: ${params.affectedCount}` : ''}

التفاصيل:
${params.details}`;

  return {
    subject,
    html: wrapHtmlEmail(subject, bodyContent, footerLinks, params.siteUrl),
    text
  };
}
