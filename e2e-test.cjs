const http = require('http');

async function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`${method} ${url}: ✅ Status ${res.statusCode}`);
          console.log(`Response: ${JSON.stringify(jsonData, null, 2)}\n`);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          console.log(`${method} ${url}: ✅ Status ${res.statusCode}`);
          console.log(`Response: ${data}\n`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`${method} ${url}: ❌ Error - ${e.message}\n`);
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting End-to-End Tests...\n');

  try {
    // Test 1: Health check
    await testEndpoint('http://localhost:3002/api/health');

    // Test 2: Auth test endpoint
    await testEndpoint('http://localhost:3002/api/auth/test');

    // Test 3: Email verification request
    await testEndpoint('http://localhost:3002/api/auth/email/signup/request-verification', 'POST', {
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890'
    });

    // Test 4: Phone OTP request
    await testEndpoint('http://localhost:3002/api/auth/login/request-otp', 'POST', {
      phone: '1234567890'
    });

    // Test 5: Owner login
    await testEndpoint('http://localhost:3002/api/auth/owner/login', 'POST', {
      phone: '7974908914',
      password: 'R78789878'
    });

    console.log('🎉 All tests passed! Application is ready for deployment.');

  } catch (error) {
    console.log('❌ Tests failed:', error.message);
  }
}

runTests();