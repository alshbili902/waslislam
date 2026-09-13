const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, ok: res.ok, data, setCookie };
}

async function runTests() {
  console.log('==================================================');
  console.log('   STARTING USER AUTHENTICATION TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return fn()
      .then(() => {
        console.log(`✓ [PASS] ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`✗ [FAIL] ${name}`);
        console.error(`       Error: ${err.message}`);
        failed++;
      });
  }

  const testUser = `test_user_${Date.now()}`;
  const testClient = 'عبدالرحمن الشبيلي التجريبي';
  const testPass = 'Secret123@#';
  let sessionCookie = '';

  // 1. Missing client name
  await test('Registration without clientName should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: '',
        username: testUser,
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('اسم العميل مطلوب'));
  });

  // 2. Missing username
  await test('Registration without username should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: '',
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('اسم المستخدم'));
  });

  // 3. Reserved username
  await test('Registration with reserved username (admin) should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: 'admin',
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('محجوز'));
  });

  // 4. Invalid username format (spaces or symbols)
  await test('Registration with invalid username (spaces/symbols) should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: 'user with spaces!',
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 5. Short password (<6 chars)
  await test('Registration with short password should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: testUser,
        password: '123',
        confirmPassword: '123',
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('6 أحرف'));
  });

  // 6. Password mismatch
  await test('Registration with password mismatch should fail (400)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: testUser,
        password: testPass,
        confirmPassword: 'DifferentPassword123',
      }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('غير متطابقتين'));
  });

  // 7. Check username availability before registering
  await test('check-username should report available for new username', async () => {
    const res = await request(`/api/auth/check-username?username=${testUser}`);
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.available, true);
  });

  // 8. Successful Registration
  await test('Successful registration with all 4 valid fields (201)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: testClient,
        username: testUser,
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.fullName, testClient);
    assert.strictEqual(res.data.user.username, testUser);
    assert(!res.data.user.password);
    assert(!res.data.user.passwordHash);
    assert(res.setCookie && res.setCookie.includes('wasl_user_session'));
    // Store session cookie
    sessionCookie = res.setCookie.split(';')[0];
  });

  // 9. Check username availability after registering
  await test('check-username should report unavailable for registered username', async () => {
    const res = await request(`/api/auth/check-username?username=${testUser}`);
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.available, false);
    assert(res.data.reason.includes('مستخدم بالفعل'));
  });

  // 10. Duplicate registration with exact username
  await test('Duplicate registration with same username should fail (409)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: 'شخص آخر',
        username: testUser,
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('مستخدم بالفعل'));
  });

  // 11. Duplicate registration with DIFFERENT CASE (e.g. uppercase)
  await test('Duplicate registration with DIFFERENT CASE should fail (409)', async () => {
    const upperUser = testUser.toUpperCase();
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        clientName: 'شخص بحروف كبرى',
        username: upperUser,
        password: testPass,
        confirmPassword: testPass,
      }),
    });
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('مستخدم بالفعل'));
  });

  // 12. Verify session via /api/auth/me
  await test('Session verification via /api/auth/me with session cookie', async () => {
    const res = await request('/api/auth/me', {
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.authenticated, true);
    assert.strictEqual(res.data.user.username, testUser);
    assert.strictEqual(res.data.user.fullName, testClient);
    assert(!res.data.user.email); // No email required
  });

  // 13. Login with wrong password
  await test('Login with wrong password should return safe generic error (401)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: testUser,
        password: 'WrongPassword999!',
      }),
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, 'اسم المستخدم أو كلمة المرور غير صحيحة.');
  });

  // 14. Login with non-existent username
  await test('Login with non-existent username should return safe generic error (401)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'non_existent_user_9999',
        password: testPass,
      }),
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error, 'اسم المستخدم أو كلمة المرور غير صحيحة.');
  });

  // 15. Successful Login (Case Insensitive)
  await test('Successful login with username (uppercase) and password (200)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: testUser.toUpperCase(),
        password: testPass,
      }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.username, testUser);
    assert.strictEqual(res.data.user.fullName, testClient);
    assert(res.setCookie && res.setCookie.includes('wasl_user_session'));
    sessionCookie = res.setCookie.split(';')[0];
  });

  // 16. Logout
  await test('Logout via /api/auth/logout clears cookie and invalidates session', async () => {
    const res = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.setCookie && (res.setCookie.includes('Max-Age=0') || res.setCookie.includes('Expires=')));
  });

  // 17. Access /api/auth/me after logout
  await test('Access /api/auth/me after logout should return authenticated: false', async () => {
    const res = await request('/api/auth/me', {
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.authenticated, false);
  });

  // 18. Admin route independence
  await test('Admin route /api/admin/me remains completely independent and protected', async () => {
    const res = await request('/api/admin/me');
    assert.strictEqual(res.status, 401);
  });

  console.log('\n==================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal error in tests:', e);
  process.exit(1);
});
