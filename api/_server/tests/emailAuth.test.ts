// Test script for email authentication
// Run this to test the email authentication endpoints

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

async function testEmailAuthentication() {
  console.log('🧪 Testing Email Authentication System...\n');

  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;

  try {
    // Test 1: Request email verification for signup
    console.log('1. Requesting email verification...');
    const verificationResponse = await axios.post(`${API_BASE_URL}/auth/email/signup/request-verification`, {
      email: testEmail,
      name: 'Test User',
      phone: '1234567890'
    });
    
    console.log('✅ Verification request sent:', verificationResponse.data);
    
    // In development mode, the verification code is returned
    const verificationCode = verificationResponse.data.code;
    
    // Test 2: Verify email and complete registration
    console.log('\n2. Verifying email and registering...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/email/signup/verify`, {
      email: testEmail,
      verificationCode: verificationCode,
      password: 'password123'
    });
    
    console.log('✅ Registration completed:', registerResponse.data);
    
    // Test 3: Login with email and password
    console.log('\n3. Testing email login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/email/login`, {
      email: testEmail,
      password: 'password123'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
    // Test 4: Request password reset
    console.log('\n4. Requesting password reset...');
    const resetRequestResponse = await axios.post(`${API_BASE_URL}/auth/email/password-reset/request`, {
      email: testEmail
    });
    
    console.log('✅ Password reset request sent:', resetRequestResponse.data);
    
    const resetCode = resetRequestResponse.data.code;
    
    // Test 5: Reset password with code
    console.log('\n5. Resetting password...');
    const resetResponse = await axios.post(`${API_BASE_URL}/auth/email/password-reset/verify`, {
      email: testEmail,
      resetCode: resetCode,
      newPassword: 'newpassword123'
    });
    
    console.log('✅ Password reset successful:', resetResponse.data);
    
    // Test 6: Login with new password
    console.log('\n6. Testing login with new password...');
    const newLoginResponse = await axios.post(`${API_BASE_URL}/auth/email/login`, {
      email: testEmail,
      password: 'newpassword123'
    });
    
    console.log('✅ New password login successful:', newLoginResponse.data);
    
    console.log('\n🎉 All email authentication tests passed!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testEmailAuthentication();