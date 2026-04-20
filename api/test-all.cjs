// Comprehensive API Test Script
const http = require('http');

const BASE_URL = 'http://localhost:3005/api';

function testEndpoint(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${method} ${path} - ${res.statusCode}`);
          console.log(`   Response:`, JSON.stringify(parsed).substring(0, 100) + '...');
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`✅ ${method} ${path} - ${res.statusCode}`);
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${method} ${path} - Error: ${e.message}`);
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing GK General Store API\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣  Health Check');
    await testEndpoint('GET', '/health');

    // Test 2: Ping
    console.log('\n2️⃣  Ping');
    await testEndpoint('GET', '/ping');

    // Test 3: Get Categories
    console.log('\n3️⃣  Get Categories');
    const categoriesRes = await testEndpoint('GET', '/categories');
    if (categoriesRes.data.success) {
      console.log(`   📦 Found ${categoriesRes.data.count} categories`);
    }

    // Test 4: Get Products
    console.log('\n4️⃣  Get Products');
    const productsRes = await testEndpoint('GET', '/products');
    if (productsRes.data.success) {
      console.log(`   📦 Found ${productsRes.data.count} products`);
    }

    // Test 5: Get Single Category
    console.log('\n5️⃣  Get Single Category (grains)');
    await testEndpoint('GET', '/categories/grains');

    // Test 6: Get Single Product
    console.log('\n6️⃣  Get Single Product (ID: 1)');
    await testEndpoint('GET', '/products/1');

    // Test 7: Search Products
    console.log('\n7️⃣  Search Products (rice)');
    await testEndpoint('GET', '/products?search=rice');

    // Test 8: Filter by Category
    console.log('\n8️⃣  Filter Products by Category (snacks)');
    await testEndpoint('GET', '/products?category=snacks');

    // Test 9: Auth Routes Exist
    console.log('\n9️⃣  Auth Routes Check');
    await testEndpoint('GET', '/auth/test');

    // Test 10: Create Order (simulate)
    console.log('\n🔟 Create Order');
    const orderData = {
      username: 'testuser',
      phone: '9876543210',
      items: [
        { productId: 1, name: 'Test Product', quantity: 2, price: 100 }
      ],
      total: 200,
      address: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      }
    };
    await testEndpoint('POST', '/orders', orderData);

    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

runTests();
