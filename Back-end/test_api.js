const BASE_URL = 'http://localhost:5001/api';

const runTests = async () => {
  console.log('🏁 Starting API Integration Verification Tests (using native fetch)...');

  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = 'Password@123';
  const testName = 'John Doe';
  let token = '';

  try {
    // 1. Register User
    console.log('\nTesting: POST /auth/register...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const registerData = await registerRes.json();
    if (registerRes.status === 201 && registerData.token) {
      console.log('✅ Registration SUCCESS!');
      console.log(`   User ID: ${registerData._id}`);
      token = registerData.token;
    } else {
      throw new Error(`Invalid registration response: ${JSON.stringify(registerData)}`);
    }

    // 2. Login User
    console.log('\nTesting: POST /auth/login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      console.log('✅ Login SUCCESS!');
    } else {
      throw new Error(`Invalid login response: ${JSON.stringify(loginData)}`);
    }

    // 3. Get Auth Me Profile
    console.log('\nTesting: GET /auth/me...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });

    const meData = await meRes.json();
    if (meRes.status === 200 && meData.email === testEmail) {
      console.log('✅ Get Profile SUCCESS!');
      console.log(`   Name: ${meData.name}`);
      console.log(`   Email: ${meData.email}`);
    } else {
      throw new Error(`Invalid profile response: ${JSON.stringify(meData)}`);
    }

    // 4. Get Resume History (should be empty initially)
    console.log('\nTesting: GET /resume/all...');
    const historyRes = await fetch(`${BASE_URL}/resume/all`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });

    const historyData = await historyRes.json();
    if (historyRes.status === 200 && Array.isArray(historyData)) {
      console.log('✅ Get History SUCCESS!');
      console.log(`   Resumes in history: ${historyData.length}`);
    } else {
      throw new Error(`Invalid history response: ${JSON.stringify(historyData)}`);
    }

    console.log('\n🎉 ALL BASE API INTEGRATION TESTS PASSED!');
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error(`   Error message: ${error.message}`);
    process.exit(1);
  }
};

runTests();
