import express from 'express';
import path from 'path';
import https from 'https';
import http from 'http';
import os from 'os';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';
import { adminRouter, getPublicDonations, getPublicBinBazLinks, getPublicWirdForDate } from './server-admin';
import { userAuthRouter } from './server-user-auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cookie parsing middleware
  app.use((req, res, next) => {
    const header = req.headers.cookie;
    const cookies: Record<string, string> = {};
    if (header) {
      header.split(';').forEach((part) => {
        const [key, ...vals] = part.trim().split('=');
        if (key) {
          try {
            cookies[key] = decodeURIComponent(vals.join('='));
          } catch {
            cookies[key] = vals.join('=');
          }
        }
      });
    }
    (req as any).cookies = cookies;
    next();
  });

  // Dedicated User Authentication API Router
  app.use('/api/auth', userAuthRouter);

  // Dedicated Admin API Router
  app.use('/api/admin', adminRouter);

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Public Daily Wird Endpoints
  app.get(['/api/wird', '/api/wird/today'], (req, res) => {
    const dateParam = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const scheduled = getPublicWirdForDate(dateParam);
    if (scheduled) {
      return res.json({ wird: scheduled, source: 'admin_scheduled' });
    }
    return res.json({ wird: null, source: 'deterministic_verified' });
  });

  // Daily Wird Progress sync endpoint
  app.post('/api/wird/progress', (req, res) => {
    res.json({ ok: true });
  });

  // Public Donation Platforms Endpoint
  app.get('/api/donations', (req, res) => {
    res.json({ platforms: getPublicDonations() });
  });

  // Public Sheikh Ibn Baz Links Endpoint
  app.get('/api/binbaz', (req, res) => {
    res.json({ links: getPublicBinBazLinks() });
  });

  // Radio Stream Validation Endpoint
  app.post('/api/radio/validate-stream', (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        reachable: false,
        status: 'unavailable',
        message: 'رابط البث مطلوب وغير صالح',
      });
    }

    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const reqStartTime = Date.now();
      let isDone = false;

      const finish = (result: {
        reachable: boolean;
        status: 'working' | 'stopped' | 'unavailable';
        statusCode?: number;
        contentType?: string;
        message: string;
      }) => {
        if (!isDone) {
          isDone = true;
          res.json({
            ...result,
            latencyMs: Date.now() - reqStartTime,
          });
        }
      };

      const streamReq = client.request(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Range: 'bytes=0-1024',
          },
        },
        (streamRes) => {
          const statusCode = streamRes.statusCode || 0;
          const contentType = streamRes.headers['content-type'] || '';

          // Disconnect quickly once headers are received
          streamRes.destroy();

          if (
            (statusCode >= 200 && statusCode < 300) ||
            statusCode === 301 ||
            statusCode === 302 ||
            statusCode === 307
          ) {
            finish({
              reachable: true,
              status: 'working',
              statusCode,
              contentType,
              message: 'البث المباشر يعمل بصورة ممتازة ومتاح للاستماع',
            });
          } else if (statusCode === 404) {
            finish({
              reachable: false,
              status: 'stopped',
              statusCode,
              contentType,
              message: 'رابط البث غير موجود (404 Not Found)',
            });
          } else {
            finish({
              reachable: false,
              status: 'unavailable',
              statusCode,
              contentType,
              message: `استجابة غير متوقعة من خادم البث (رمز الاستجابة: ${statusCode})`,
            });
          }
        }
      );

      streamReq.setTimeout(6000, () => {
        streamReq.destroy();
        finish({
          reachable: false,
          status: 'unavailable',
          message: 'انتهت مهلة انتظار استجابة خادم البث (تجاوز 6 ثوان)',
        });
      });

      streamReq.on('error', (err) => {
        finish({
          reachable: false,
          status: 'unavailable',
          message: `خطأ أثناء الاتصال بالبث: ${err.message}`,
        });
      });

      streamReq.end();
    } catch (e: any) {
      return res.status(400).json({
        reachable: false,
        status: 'unavailable',
        message: 'تعذر تحليل عنوان الرابط: ' + (e?.message || ''),
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: true,
        cors: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Resolve local IPv4 addresses (Wi-Fi and LAN)
  const networkAddresses: { name: string; url: string }[] = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        networkAddresses.push({
          name,
          url: `http://${net.address}:${PORT}`,
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n======================================================');
    console.log('  وصل الإسلامية - Wasl Islamic Platform');
    console.log('======================================================');
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    networkAddresses.forEach((item) => {
      console.log(`  ➜  Network: ${item.url}/ (${item.name})`);
    });
    console.log('======================================================');

    const primaryNetwork = networkAddresses.find((n) => n.name.includes('Wi-Fi') || n.name.includes('شبكة')) || networkAddresses[0];
    if (primaryNetwork) {
      try {
        const qrString = await QRCode.toString(primaryNetwork.url, { type: 'terminal', small: true });
        console.log(`\n  افتح الرابط في هاتفك: ${primaryNetwork.url}`);
        console.log('  أو امسح رمز الـ QR مباشرة بكاميرا الهاتف:');
        console.log(qrString);
      } catch {
        // QR display fallback
      }
    }
  });
}

startServer();
