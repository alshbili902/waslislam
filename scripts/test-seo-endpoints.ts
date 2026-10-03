import http from 'http';

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

async function runSeoTests() {
  console.log('========================================================');
  console.log('   WASL ISLAMIC — SEO & INDEXING VERIFICATION TESTS');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Test /sitemap.xml
  try {
    const res = await fetchUrl('http://localhost:3000/sitemap.xml');
    assert('Sitemap returns HTTP 200', res.statusCode === 200, `status: ${res.statusCode}`);
    assert(
      'Sitemap Content-Type is application/xml',
      (res.headers['content-type'] || '').includes('application/xml'),
      `type: ${res.headers['content-type']}`
    );
    assert(
      'Sitemap DOES NOT have X-Robots-Tag header',
      !res.headers['x-robots-tag'],
      `x-robots-tag: ${res.headers['x-robots-tag']}`
    );
    assert(
      'Sitemap DOES NOT contain noindex in headers',
      !JSON.stringify(res.headers).toLowerCase().includes('noindex')
    );
    assert(
      'Sitemap starts with XML declaration',
      res.body.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')
    );
    assert(
      'Sitemap contains <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      res.body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    );
    assert(
      'Sitemap contains canonical domain https://waslislam.fun/',
      res.body.includes('<loc>https://waslislam.fun/</loc>')
    );
    assert(
      'Sitemap contains Quran section',
      res.body.includes('<loc>https://waslislam.fun/quran</loc>')
    );
    assert(
      'Sitemap contains Surah Al-Baqarah (/quran/listen/2)',
      res.body.includes('<loc>https://waslislam.fun/quran/listen/2</loc>')
    );
    assert(
      'Sitemap DOES NOT contain /admin',
      !res.body.includes('/admin')
    );
    assert(
      'Sitemap DOES NOT contain /dashboard',
      !res.body.includes('/dashboard')
    );
    assert(
      'Sitemap DOES NOT contain /login',
      !res.body.includes('/login')
    );
    assert(
      'Sitemap DOES NOT contain /register',
      !res.body.includes('/register')
    );
    assert(
      'Sitemap DOES NOT contain localhost or 127.0.0.1',
      !res.body.includes('localhost') && !res.body.includes('127.0.0.1')
    );
  } catch (err: any) {
    assert('Sitemap request succeeded', false, err.message);
  }

  // 2. Test /robots.txt
  try {
    const res = await fetchUrl('http://localhost:3000/robots.txt');
    assert('robots.txt returns HTTP 200', res.statusCode === 200, `status: ${res.statusCode}`);
    assert(
      'robots.txt Content-Type is text/plain',
      (res.headers['content-type'] || '').includes('text/plain'),
      `type: ${res.headers['content-type']}`
    );
    assert(
      'robots.txt has User-agent: *',
      res.body.includes('User-agent: *')
    );
    assert(
      'robots.txt allows root (Allow: /)',
      res.body.includes('Allow: /')
    );
    assert(
      'robots.txt disallows /admin',
      res.body.includes('Disallow: /admin')
    );
    assert(
      'robots.txt disallows /dashboard',
      res.body.includes('Disallow: /dashboard')
    );
    assert(
      'robots.txt disallows /login',
      res.body.includes('Disallow: /login')
    );
    assert(
      'robots.txt disallows /register',
      res.body.includes('Disallow: /register')
    );
    assert(
      'robots.txt links to official sitemap https://waslislam.fun/sitemap.xml',
      res.body.includes('Sitemap: https://waslislam.fun/sitemap.xml')
    );
    assert(
      'robots.txt has Host: waslislam.fun',
      res.body.includes('Host: waslislam.fun')
    );
  } catch (err: any) {
    assert('robots.txt request succeeded', false, err.message);
  }

  // 3. Test 301 Canonicalization redirect for www.waslislam.fun
  try {
    const res = await fetchUrl('http://localhost:3000/quran', {
      host: 'www.waslislam.fun',
    });
    assert(
      'www.waslislam.fun redirects with 301',
      res.statusCode === 301,
      `status: ${res.statusCode}`
    );
    assert(
      'redirects to https://waslislam.fun/quran',
      res.headers.location === 'https://waslislam.fun/quran',
      `location: ${res.headers.location}`
    );
  } catch (err: any) {
    assert('Canonical redirect request succeeded', false, err.message);
  }

  // 4. Test production HTML SEO injection
  try {
    const { injectSeoMetadata } = await import('../src/seo/seoGenerator');
    const mockHtml = `<!doctype html>
<html>
  <head>
    <title>Old Title</title>
    <meta name="description" content="Old Description" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    // A. Public route: /quran
    const quranHtml = injectSeoMetadata(mockHtml, '/quran');
    assert('Injected Quran HTML includes new title', quranHtml.includes('<title>القرآن الكريم'));
    assert('Injected Quran HTML has canonical URL', quranHtml.includes('<link rel="canonical" href="https://waslislam.fun/quran"'));
    assert('Injected Quran HTML has index, follow robots', quranHtml.includes('<meta name="robots" content="index, follow'));
    assert('Injected Quran HTML has OpenGraph tags', quranHtml.includes('<meta property="og:site_name" content="وصل الإسلامية"'));
    assert('Injected Quran HTML has WebSite JSON-LD', quranHtml.includes('"@type": "WebSite"'));
    assert('Injected Quran HTML has BreadcrumbList JSON-LD', quranHtml.includes('"@type": "BreadcrumbList"'));

    // B. Public dynamic route: /quran/listen/2 (Al-Baqarah)
    const baqarahHtml = injectSeoMetadata(mockHtml, '/quran/listen/2');
    assert('Dynamic Surah HTML includes سورة البقرة', baqarahHtml.includes('البَقَرَة') || baqarahHtml.includes('البقرة'));
    assert('Dynamic Surah HTML has canonical URL', baqarahHtml.includes('<link rel="canonical" href="https://waslislam.fun/quran/listen/2"'));

    // C. Private route: /admin
    const adminHtml = injectSeoMetadata(mockHtml, '/admin');
    assert('Private admin HTML has noindex, nofollow', adminHtml.includes('<meta name="robots" content="noindex, nofollow"'));
    assert('Private admin HTML has no public schema leak', !adminHtml.includes('"@type": "BreadcrumbList"'));
  } catch (err: any) {
    assert('HTML SEO injection logic succeeded', false, err.message);
  }

  console.log('\n========================================================');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSeoTests();
