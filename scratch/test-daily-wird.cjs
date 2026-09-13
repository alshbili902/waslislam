const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 3000,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING DAILY WIRD (ورد اليوم) VERIFICATION SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test Public Endpoint GET /api/wird
  try {
    const res1 = await request('http://localhost:3000/api/wird?date=2026-09-13');
    assert(res1.status === 200, 'GET /api/wird responds with 200 OK');
    assert(res1.body.source !== undefined, 'GET /api/wird returns valid response structure');
  } catch (err) {
    assert(false, `GET /api/wird network check: ${err.message}`);
  }

  // 2. Test Progress Endpoint POST /api/wird/progress
  try {
    const res2 = await request(
      'http://localhost:3000/api/wird/progress',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        userId: 'test-user-123',
        date: '2026-09-13',
        wirdId: 'wird-2026-09-13',
        itemId: 'wird-item-quran-2026-09-13',
        completed: true,
        count: 1,
        percentage: 20,
      }
    );
    assert(res2.status === 200 && res2.body.ok === true, 'POST /api/wird/progress successfully accepts progress update');
  } catch (err) {
    assert(false, `POST /api/wird/progress check: ${err.message}`);
  }

  // 3. Test Admin Auth Protection on /api/admin/wird
  try {
    const res3 = await request('http://localhost:3000/api/admin/wird');
    assert(res3.status === 401, 'GET /api/admin/wird correctly requires admin authentication (401)');
  } catch (err) {
    assert(false, `Admin auth check: ${err.message}`);
  }

  // 4. Test Admin Login and Scheduling
  try {
    const loginRes = await request(
      'http://localhost:3000/api/admin/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'alshbili',
        password: 'alshbili81@',
      }
    );
    assert(loginRes.status === 200 && loginRes.body.authenticated === true, 'Admin login succeeds with credentials');

    const setCookie = loginRes.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie || '';

    // Test GET /api/admin/wird with cookie
    const adminWirdRes = await request('http://localhost:3000/api/admin/wird', {
      headers: { Cookie: cookieHeader },
    });
    assert(adminWirdRes.status === 200 && Array.isArray(adminWirdRes.body.wirds), 'Authenticated admin can list scheduled wirds');

    // Test Rejecting Unverified Content in Admin POST /api/admin/wird
    const invalidPost = await request(
      'http://localhost:3000/api/admin/wird',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      },
      {
        date: '2026-09-20',
        title: 'ورد غير موثق',
        items: [
          {
            type: 'hadith',
            hadithData: { textAr: 'حديث بدون تخريج' }, // Missing collectionAr
          },
        ],
      }
    );
    assert(invalidPost.status === 400, 'Religious Verification Gate rejects unverified Hadith without collection/source');

    // Test Scheduling Verified Wird
    const validPost = await request(
      'http://localhost:3000/api/admin/wird',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      },
      {
        date: '2026-09-25',
        title: 'ورد الجمعة المجدول',
        subtitle: 'ورد مخصص ليوم الجمعة',
        status: 'published',
        isFriday: true,
        items: [
          {
            id: 'item-quran-1',
            type: 'quran',
            titleAr: 'سورة الكهف',
            targetCount: 1,
            isVerified: true,
            sourceReference: 'سورة الكهف [1-10]',
            quranData: {
              surahNumber: 18,
              surahNameAr: 'الكهف',
              startAyah: 1,
              endAyah: 10,
              ayahText: 'الحمد لله الذي أنزل على عبده الكتاب ولم يجعل له عوجا...',
              juzNumber: 15,
              pageNumber: 293,
            },
          },
          {
            id: 'item-dhikr-1',
            type: 'dhikr',
            titleAr: 'الصلاة على النبي ﷺ',
            targetCount: 10,
            isVerified: true,
            sourceReference: 'صحيح البخاري (3370)',
            dhikrData: {
              dhikrId: 'm-salawat',
              categorySlug: 'general',
              categoryNameAr: 'سنن الجمعة',
              textAr: 'اللهم صل على محمد وعلى آل محمد...',
              sourceAr: 'صحيح البخاري (3370)',
              repeatTarget: 10,
            },
          },
          {
            id: 'item-hadith-1',
            type: 'hadith',
            titleAr: 'حديث فضل يوم الجمعة',
            targetCount: 1,
            isVerified: true,
            sourceReference: 'صحيح مسلم (854)',
            hadithData: {
              hadithId: 'h-friday',
              collectionAr: 'صحيح مسلم',
              narratorAr: 'أبي هريرة رضي الله عنه',
              textAr: 'خير يوم طلعت عليه الشمس يوم الجمعة...',
              gradingAr: 'صحيح مسلم',
            },
          },
          {
            id: 'item-dua-1',
            type: 'dua',
            titleAr: 'دعاء الاستجابة',
            targetCount: 1,
            isVerified: true,
            sourceReference: 'سورة البقرة 201',
            duaData: {
              duaId: 'd-quran-1',
              titleAr: 'دعاء جامع',
              textAr: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
              sourceAr: 'سورة البقرة 201',
            },
          },
          {
            id: 'item-tasbih-1',
            type: 'tasbih',
            titleAr: 'التسبيح',
            targetCount: 33,
            isVerified: true,
            sourceReference: 'صحيح مسلم',
            tasbihData: {
              phraseAr: 'سبحان الله وبحمده',
              targetCount: 33,
            },
          },
        ],
      }
    );
    assert(validPost.status === 200 && validPost.body.ok === true, 'Admin can successfully schedule a verified Daily Wird');

    // Test Public Retrieval of Scheduled Wird
    const getScheduled = await request('http://localhost:3000/api/wird?date=2026-09-25');
    assert(
      getScheduled.status === 200 &&
        getScheduled.body.wird &&
        getScheduled.body.wird.date === '2026-09-25' &&
        getScheduled.body.wird.title === 'ورد الجمعة المجدول',
      'Public endpoint retrieves scheduled wird by date'
    );
  } catch (err) {
    assert(false, `Admin scheduling test: ${err.message}`);
  }

  console.log(`\n--- RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
