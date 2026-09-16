import { Router, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import dns from 'dns/promises';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

export const channelsRouter = Router();

// ====================================================
// 1. Supabase Admin & Database Client Configuration
// ====================================================
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const databaseUrl = process.env.DATABASE_URL || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

const pgPool = databaseUrl ? new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
}) : null;

// Helper to query Postgres safely
async function executeQuery<T = any>(text: string, params: any[] = []): Promise<T[]> {
  if (pgPool) {
    const client = await pgPool.connect();
    try {
      const res = await client.query(text, params);
      return res.rows as T[];
    } finally {
      client.release();
    }
  }
  return [];
}

// ====================================================
// 2. SSRF Protection & Safe HTTP Client
// ====================================================
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;

  // IPv4 Loopback & Special
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '::1') return true;
  if (ip.startsWith('127.')) return true;

  // IPv4 Private Ranges
  // 10.0.0.0 - 10.255.255.255
  if (ip.startsWith('10.')) return true;

  // 172.16.0.0 - 172.31.255.255
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0 - 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0 - 169.254.255.255 (Link-local / AWS metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  }

  // IPv6 ULA or Link-Local
  const lower = ip.toLowerCase();
  if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) return true;

  return false;
}

export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; reason?: string; parsedUrl?: URL }> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'الرابط غير محدد أو غير صالح' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { safe: false, reason: 'صيغة الرابط غير صحيحة' };
  }

  // Only allow HTTP/HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: 'يسمح فقط ببروتوكولات HTTP و HTTPS الآمنة' };
  }

  // Reject credentials in URL
  if (parsed.username || parsed.password) {
    return { safe: false, reason: 'لا يسمح ببيانات اعتماد في الرابط' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return { safe: false, reason: 'لا يسمح بطلب العناوين المحلية والخاصة' };
  }

  // Resolve DNS to verify it doesn't map to a private/internal IP
  try {
    const lookupResult = await dns.lookup(hostname, { all: true });
    for (const record of lookupResult) {
      if (isPrivateIp(record.address)) {
        return { safe: false, reason: 'عنوان الـ IP المستهدف يقع ضمن شبكة خاصة أو محظورة' };
      }
    }
  } catch (err: any) {
    return { safe: false, reason: `تعذر تحليل اسم النطاق: ${err.message || 'DNS lookup failed'}` };
  }

  return { safe: true, parsedUrl: parsed };
}

// Safe fetch with redirect following and size limit
async function safeFetchText(urlStr: string, maxBytes = 5 * 1024 * 1024, maxRedirects = 3): Promise<string> {
  let currentUrl = urlStr;
  let redirects = 0;

  while (redirects <= maxRedirects) {
    const validation = await validateSafeUrl(currentUrl);
    if (!validation.safe || !validation.parsedUrl) {
      throw new Error(validation.reason || 'رابط غير آمن');
    }

    const isHttps = validation.parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const result = await new Promise<{ text: string; redirect?: string }>((resolve, reject) => {
      const req = client.get(
        currentUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: '*/*',
          },
          timeout: 8000,
        },
        (res) => {
          const status = res.statusCode || 0;

          // Handle redirects
          if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, currentUrl).href;
            res.destroy();
            return resolve({ text: '', redirect: redirectUrl });
          }

          if (status < 200 || status >= 400) {
            res.destroy();
            return reject(new Error(`فشل الخادم الخارجي بالرمز: ${status}`));
          }

          let data = '';
          let received = 0;

          res.setEncoding('utf-8');
          res.on('data', (chunk) => {
            received += chunk.length;
            if (received > maxBytes) {
              res.destroy();
              return reject(new Error('حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميغابايت)'));
            }
            data += chunk;
          });

          res.on('end', () => resolve({ text: data }));
          res.on('error', (err) => reject(err));
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('انتهت مهلة الاتصال بالخادم الخارجي'));
      });

      req.on('error', (err) => reject(err));
    });

    if (result.redirect) {
      currentUrl = result.redirect;
      redirects++;
      continue;
    }

    return result.text;
  }

  throw new Error('تم تجاوز الحد الأقصى للتوجيهات');
}

// ====================================================
// 3. Stream Validation Endpoint
// ====================================================
channelsRouter.post('/validate-stream', async (req: Request, res: Response) => {
  const url = (req.body?.url || req.body?.streamUrl) as string;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      reachable: false,
      status: 'unavailable',
      message: 'رابط البث مطلوب وغير صالح',
    });
  }

  const safeCheck = await validateSafeUrl(url);
  if (!safeCheck.safe || !safeCheck.parsedUrl) {
    return res.status(400).json({
      reachable: false,
      status: 'unavailable',
      message: safeCheck.reason || 'رابط غير آمن أو غير مصرح به',
    });
  }

  const reqStartTime = Date.now();
  const isHttps = safeCheck.parsedUrl.protocol === 'https:';
  const client = isHttps ? https : http;

  try {
    const result = await new Promise<{
      reachable: boolean;
      status: 'working' | 'stopped' | 'unavailable';
      statusCode?: number;
      contentType?: string;
      message: string;
    }>((resolve) => {
      const streamReq = client.request(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Range: 'bytes=0-2048',
          },
          timeout: 6000,
        },
        (streamRes) => {
          const statusCode = streamRes.statusCode || 0;
          const contentType = (streamRes.headers['content-type'] || '').toLowerCase();

          let bodySnippet = '';
          streamRes.on('data', (chunk) => {
            bodySnippet += chunk.toString();
            if (bodySnippet.length > 512) {
              streamRes.destroy();
            }
          });

          streamRes.on('close', () => {
            const isM3uContentType =
              contentType.includes('mpegurl') ||
              contentType.includes('application/x-mpegurl') ||
              contentType.includes('audio/x-mpegurl') ||
              contentType.includes('video/mp2t') ||
              contentType.includes('application/vnd.apple.mpegurl') ||
              contentType.includes('text/plain') ||
              contentType.includes('octet-stream');

            const isM3uBody = bodySnippet.includes('#EXTM3U') || bodySnippet.includes('#EXTINF');

            if ((statusCode >= 200 && statusCode < 400) || statusCode === 206) {
              if (isM3uContentType || isM3uBody || url.includes('.m3u8') || url.includes('.m3u')) {
                resolve({
                  reachable: true,
                  status: 'working',
                  statusCode,
                  contentType,
                  message: 'البث متصل ومتاح ويعمل بصورة طبيعية',
                });
              } else {
                resolve({
                  reachable: true,
                  status: 'working',
                  statusCode,
                  contentType,
                  message: `تم الوصول للبث بنجاح (${contentType || 'استجابة صحيحة'})`,
                });
              }
            } else {
              resolve({
                reachable: false,
                status: 'stopped',
                statusCode,
                contentType,
                message: `الخادم أرجع استجابة خطأ برمز: ${statusCode}`,
              });
            }
          });
        }
      );

      streamReq.on('timeout', () => {
        streamReq.destroy();
        resolve({
          reachable: false,
          status: 'unavailable',
          message: 'انتهت مهلة الاتصال بالبث المباشر (أكثر من 6 ثوانٍ)',
        });
      });

      streamReq.on('error', (err) => {
        resolve({
          reachable: false,
          status: 'unavailable',
          message: `تعذر الاتصال بالبث: ${err.message}`,
        });
      });

      streamReq.end();
    });

    return res.json({
      ...result,
      latencyMs: Date.now() - reqStartTime,
    });
  } catch (err: any) {
    return res.status(500).json({
      reachable: false,
      status: 'unavailable',
      message: `خطأ أثناء التحقق من البث: ${err.message}`,
    });
  }
});

// ====================================================
// 4. M3U Playlist Parser Endpoint
// ====================================================
interface ParsedChannelItem {
  id: string;
  name: string;
  streamUrl: string;
  streamType: 'hls' | 'm3u' | 'unknown';
  logoUrl?: string;
  group?: string;
  country?: string;
  language?: string;
}

export function parseM3uContent(content: string): ParsedChannelItem[] {
  const lines = content.split(/\r?\n/);
  const items: ParsedChannelItem[] = [];

  let currentItem: Partial<ParsedChannelItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    if (rawLine.startsWith('#EXTINF:')) {
      currentItem = {};

      // Extract attributes using regex: key="value" or key=value
      const logoMatch = rawLine.match(/tvg-logo=["']([^"']+)["']/i);
      if (logoMatch) currentItem.logoUrl = logoMatch[1].trim();

      const nameMatch = rawLine.match(/tvg-name=["']([^"']+)["']/i);
      if (nameMatch) currentItem.name = nameMatch[1].trim();

      const groupMatch = rawLine.match(/group-title=["']([^"']+)["']/i);
      if (groupMatch) currentItem.group = groupMatch[1].trim();

      const countryMatch = rawLine.match(/tvg-country=["']([^"']+)["']/i);
      if (countryMatch) currentItem.country = countryMatch[1].trim().toUpperCase();

      const langMatch = rawLine.match(/tvg-language=["']([^"']+)["']/i) || rawLine.match(/tvg-lang=["']([^"']+)["']/i);
      if (langMatch) currentItem.language = langMatch[1].trim().toLowerCase();

      // Channel title after last comma
      const commaIdx = rawLine.lastIndexOf(',');
      if (commaIdx !== -1) {
        const titlePart = rawLine.substring(commaIdx + 1).trim();
        if (titlePart && !currentItem.name) {
          currentItem.name = titlePart;
        } else if (titlePart && currentItem.name) {
          currentItem.name = titlePart; // Preferred visual title
        }
      }

      if (!currentItem.name) {
        currentItem.name = `قناة ${items.length + 1}`;
      }
    } else if (!rawLine.startsWith('#') && currentItem) {
      // Line is stream URL
      const streamUrl = rawLine;
      if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
        let streamType: 'hls' | 'm3u' | 'unknown' = 'unknown';
        const lowerUrl = streamUrl.toLowerCase();
        if (lowerUrl.includes('.m3u8')) {
          streamType = 'hls';
        } else if (lowerUrl.endsWith('.m3u') || lowerUrl.includes('.m3u?')) {
          streamType = 'm3u';
        } else {
          streamType = 'hls'; // Default for video stream links
        }

        items.push({
          id: 'parsed-' + (items.length + 1) + '-' + Math.random().toString(36).substring(2, 7),
          name: currentItem.name || `قناة ${items.length + 1}`,
          streamUrl,
          streamType,
          logoUrl: currentItem.logoUrl || '',
          group: currentItem.group || 'قنوات إسلامية',
          country: currentItem.country || 'SA',
          language: currentItem.language || 'ar',
        });
      }
      currentItem = null;
    }
  }

  return items;
}

channelsRouter.post('/parse-m3u', async (req: Request, res: Response) => {
  const url = (req.body?.url || req.body?.streamUrl || req.body?.m3uUrl) as string;
  const content = (req.body?.content || req.body?.m3uContent) as string;

  try {
    let rawContent = '';

    if (url && typeof url === 'string') {
      rawContent = await safeFetchText(url, 5 * 1024 * 1024);
    } else if (content && typeof content === 'string') {
      if (content.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'محتوى قائمة التشغيل كبير جداً (أكثر من 10 ميغابايت)' });
      }
      rawContent = content;
    } else {
      return res.status(400).json({ error: 'يرجى تزويد رابط قائمة التشغيل M3U أو المحتوى النصي' });
    }

    const channels = parseM3uContent(rawContent);

    // Collect all discovered categories
    const categoriesSet = new Set<string>();
    channels.forEach((c) => {
      if (c.group) categoriesSet.add(c.group);
    });

    // Check existing streams to flag duplicates
    const existingStreams = await executeQuery<{ stream_url: string; name: string }>(
      'SELECT stream_url, name FROM channels'
    );
    const existingUrlSet = new Set(existingStreams.map((s) => s.stream_url.toLowerCase()));

    const enrichedChannels = channels.map((ch) => ({
      ...ch,
      isDuplicate: existingUrlSet.has(ch.streamUrl.toLowerCase()),
    }));

    return res.json({
      totalFound: channels.length,
      validCount: enrichedChannels.filter((c) => !c.isDuplicate).length,
      duplicateCount: enrichedChannels.filter((c) => c.isDuplicate).length,
      categories: Array.from(categoriesSet),
      channels: enrichedChannels,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `فشل تحليل قائمة M3U: ${err.message}`,
    });
  }
});

// ====================================================
// 5. Public Channels Endpoints
// ====================================================
channelsRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await executeQuery(
      'SELECT id, name, slug, description, icon, sort_order, is_active FROM channel_categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    return res.json({ categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, featured } = req.query;

    let sql = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.logo_url, c.stream_url, 
        c.stream_type, c.playlist_url, c.category_id, c.country, c.language, 
        c.is_active, c.is_featured, c.sort_order, c.source_name, c.source_url, 
        c.license_note, c.rights_status, c.created_at,
        cat.name as category_name, cat.slug as category_slug, cat.icon as category_icon
      FROM channels c
      LEFT JOIN channel_categories cat ON c.category_id = cat.id
      WHERE c.is_active = TRUE
    `;

    const params: any[] = [];
    if (category && typeof category === 'string' && category !== 'all') {
      params.push(category);
      sql += ` AND (cat.slug = $${params.length} OR cat.id::text = $${params.length})`;
    }

    if (featured === 'true') {
      sql += ' AND c.is_featured = TRUE';
    }

    sql += ' ORDER BY c.sort_order ASC, c.created_at DESC';

    const channels = await executeQuery(sql, params);
    const categories = await executeQuery(
      'SELECT id, name, slug, description, icon, sort_order FROM channel_categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );

    return res.json({ channels, categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const channels = await executeQuery(
      `
      SELECT 
        c.id, c.name, c.slug, c.description, c.logo_url, c.stream_url, 
        c.stream_type, c.playlist_url, c.category_id, c.country, c.language, 
        c.is_active, c.is_featured, c.sort_order, c.source_name, c.source_url, 
        c.license_note, c.rights_status, c.created_at,
        cat.name as category_name, cat.slug as category_slug, cat.icon as category_icon
      FROM channels c
      LEFT JOIN channel_categories cat ON c.category_id = cat.id
      WHERE (c.slug = $1 OR c.id::text = $1) AND c.is_active = TRUE
      LIMIT 1
      `,
      [slug]
    );

    if (!channels || channels.length === 0) {
      return res.status(404).json({ error: 'القناة غير موجودة' });
    }

    return res.json({ channel: channels[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ====================================================
// 6. Admin Endpoints (CRUD & M3U Import)
// ====================================================
channelsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      logoUrl,
      streamUrl,
      streamType = 'hls',
      playlistUrl,
      categoryId,
      country = 'SA',
      language = 'ar',
      isActive = true,
      isFeatured = false,
      sortOrder = 0,
      sourceName,
      sourceUrl,
      licenseNote,
      rightsStatus = 'public_broadcast',
    } = req.body;

    if (!name || !streamUrl) {
      return res.status(400).json({ error: 'اسم القناة ورابط البث مطلوبان' });
    }

    const safeSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0621-\u064A]+/g, '-')
      .replace(/^-+|-+$/g, '') || `channel-${Date.now()}`;

    const inserted = await executeQuery(
      `
      INSERT INTO channels (
        name, slug, description, logo_url, stream_url, stream_type,
        playlist_url, category_id, country, language, is_active,
        is_featured, sort_order, source_name, source_url, license_note,
        rights_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
      `,
      [
        name,
        safeSlug,
        description || '',
        logoUrl || '',
        streamUrl,
        streamType,
        playlistUrl || null,
        categoryId || null,
        country,
        language,
        isActive,
        isFeatured,
        sortOrder,
        sourceName || null,
        sourceUrl || null,
        licenseNote || null,
        rightsStatus,
      ]
    );

    return res.json({ channel: inserted[0], success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      logoUrl,
      streamUrl,
      streamType,
      playlistUrl,
      categoryId,
      country,
      language,
      isActive,
      isFeatured,
      sortOrder,
      sourceName,
      sourceUrl,
      licenseNote,
      rightsStatus,
    } = req.body;

    const updated = await executeQuery(
      `
      UPDATE channels
      SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        logo_url = COALESCE($4, logo_url),
        stream_url = COALESCE($5, stream_url),
        stream_type = COALESCE($6, stream_type),
        playlist_url = $7,
        category_id = $8,
        country = COALESCE($9, country),
        language = COALESCE($10, language),
        is_active = COALESCE($11, is_active),
        is_featured = COALESCE($12, is_featured),
        sort_order = COALESCE($13, sort_order),
        source_name = $14,
        source_url = $15,
        license_note = $16,
        rights_status = COALESCE($17, rights_status),
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
      `,
      [
        name,
        slug,
        description,
        logoUrl,
        streamUrl,
        streamType,
        playlistUrl,
        categoryId,
        country,
        language,
        isActive,
        isFeatured,
        sortOrder,
        sourceName,
        sourceUrl,
        licenseNote,
        rightsStatus,
        id,
      ]
    );

    return res.json({ channel: updated[0], success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM channels WHERE id = $1', [id]);
    return res.json({ success: true, message: 'تم حذف القناة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.post('/batch-import', async (req: Request, res: Response) => {
  const { channels: channelsToImport, categoryMapping } = req.body;

  if (!Array.isArray(channelsToImport) || channelsToImport.length === 0) {
    return res.status(400).json({ error: 'قائمة القنوات للاستيراد فارغة' });
  }

  try {
    // Get existing categories
    const categories = await executeQuery<{ id: string; name: string; slug: string }>(
      'SELECT id, name, slug FROM channel_categories'
    );
    const catMap = new Map<string, string>();
    categories.forEach((c) => {
      catMap.set(c.slug, c.id);
      catMap.set(c.name, c.id);
    });

    let importedCount = 0;
    for (const item of channelsToImport) {
      if (!item.name || !item.streamUrl) continue;

      // Determine category ID
      let assignedCatId: string | null = null;
      if (categoryMapping && categoryMapping[item.group]) {
        assignedCatId = categoryMapping[item.group];
      } else if (item.group && catMap.has(item.group)) {
        assignedCatId = catMap.get(item.group)!;
      } else {
        // Default category
        assignedCatId = catMap.get('quran') || catMap.get('islamic-channels') || null;
      }

      const safeSlug = (item.name + '-' + Math.random().toString(36).substring(2, 6))
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await executeQuery(
        `
        INSERT INTO channels (
          name, slug, logo_url, stream_url, stream_type, category_id,
          country, language, is_active, is_featured, rights_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, FALSE, 'public_broadcast')
        ON CONFLICT (slug) DO NOTHING
        `,
        [
          item.name,
          safeSlug,
          item.logoUrl || '',
          item.streamUrl,
          item.streamType || 'hls',
          assignedCatId,
          item.country || 'SA',
          item.language || 'ar',
        ]
      );
      importedCount++;
    }

    return res.json({ success: true, importedCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Category Management
channelsRouter.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, slug, description, icon = 'Tv', sortOrder = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم التصنيف مطلوب' });

    const safeSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0621-\u064A]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const inserted = await executeQuery(
      `
      INSERT INTO channel_categories (name, slug, description, icon, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, safeSlug, description || '', icon, sortOrder]
    );

    return res.json({ category: inserted[0], success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, sortOrder, isActive } = req.body;

    const updated = await executeQuery(
      `
      UPDATE channel_categories
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        icon = COALESCE($4, icon),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [name, slug, description, icon, sortOrder, isActive, id]
    );

    return res.json({ category: updated[0], success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

channelsRouter.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM channel_categories WHERE id = $1', [id]);
    return res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
