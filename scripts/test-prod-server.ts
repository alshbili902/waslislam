import http from 'http';
import { spawn } from 'child_process';

function fetchUrl(url: string, headers: Record<string, string> = {}): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runProdVerification() {
  console.log('Starting production server (node dist/server.cjs) on PORT 3006...');

  const serverProc = spawn('node', ['dist/server.cjs'], {
    env: {
      ...process.env,
      PORT: '3006',
      NODE_ENV: 'production',
    },
    stdio: 'pipe',
  });

  serverProc.stdout.on('data', (d) => {
    // optional debug
  });
  serverProc.stderr.on('data', (d) => {
    console.error('[PROD SERVER ERROR]:', d.toString());
  });

  // Wait for server to boot
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetchUrl('http://127.0.0.1:3006/api/health');
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    console.error('Failed to connect to production server on port 3006');
    serverProc.kill();
    process.exit(1);
  }

  console.log('Production server is healthy on port 3006. Running checks...\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ [PROD PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [PROD FAIL] ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Sitemap in production
    const sitemapRes = await fetchUrl('http://127.0.0.1:3006/sitemap.xml');
    assert('Prod /sitemap.xml status is 200', sitemapRes.statusCode === 200);
    assert(
      'Prod /sitemap.xml content-type is application/xml',
      (sitemapRes.headers['content-type'] || '').includes('application/xml')
    );
    assert(
      'Prod /sitemap.xml has no X-Robots-Tag header',
      !sitemapRes.headers['x-robots-tag'],
      `x-robots-tag: ${sitemapRes.headers['x-robots-tag']}`
    );
    assert(
      'Prod /sitemap.xml contains valid XML markup',
      sitemapRes.body.includes('<urlset') && sitemapRes.body.includes('https://waslislam.fun/quran')
    );

    // 2. Robots.txt in production
    const robotsRes = await fetchUrl('http://127.0.0.1:3006/robots.txt');
    assert('Prod /robots.txt status is 200', robotsRes.statusCode === 200);
    assert(
      'Prod /robots.txt content-type is text/plain',
      (robotsRes.headers['content-type'] || '').includes('text/plain')
    );
    assert(
      'Prod /robots.txt points to https://waslislam.fun/sitemap.xml',
      robotsRes.body.includes('Sitemap: https://waslislam.fun/sitemap.xml')
    );

    // 3. Homepage SSR / Injected HTML in production
    const homeRes = await fetchUrl('http://127.0.0.1:3006/');
    assert('Prod / status is 200', homeRes.statusCode === 200);
    assert(
      'Prod / HTML includes enriched title',
      homeRes.body.includes('<title>وصل الإسلامية')
    );
    assert(
      'Prod / HTML includes canonical URL',
      homeRes.body.includes('<link rel="canonical" href="https://waslislam.fun/"')
    );
    assert(
      'Prod / HTML includes WebSite schema',
      homeRes.body.includes('"@type": "WebSite"')
    );

    // 4. Public Quran page in production
    const quranRes = await fetchUrl('http://127.0.0.1:3006/quran');
    assert('Prod /quran status is 200', quranRes.statusCode === 200);
    assert(
      'Prod /quran HTML includes Quran title',
      quranRes.body.includes('<title>القرآن الكريم')
    );
    assert(
      'Prod /quran HTML includes canonical URL',
      quranRes.body.includes('<link rel="canonical" href="https://waslislam.fun/quran"')
    );
    assert(
      'Prod /quran HTML includes BreadcrumbList schema',
      quranRes.body.includes('"@type": "BreadcrumbList"')
    );

    // 5. Private /admin page in production
    const adminRes = await fetchUrl('http://127.0.0.1:3006/admin');
    assert('Prod /admin status is 200', adminRes.statusCode === 200);
    assert(
      'Prod /admin HTML includes noindex, nofollow',
      adminRes.body.includes('<meta name="robots" content="noindex, nofollow"')
    );

    // 6. 301 Canonical redirect in production
    const redirectRes = await fetchUrl('http://127.0.0.1:3006/quran', {
      host: 'www.waslislam.fun',
    });
    assert('Prod www redirects with 301', redirectRes.statusCode === 301);
    assert(
      'Prod www redirects to https://waslislam.fun/quran',
      redirectRes.headers.location === 'https://waslislam.fun/quran'
    );
  } catch (err: any) {
    console.error('Test error:', err);
    failed++;
  } finally {
    serverProc.kill();
  }

  console.log('\n========================================================');
  console.log(`  PROD RESULTS: PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProdVerification();
