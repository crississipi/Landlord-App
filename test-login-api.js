/**
 * Test script for login API endpoints
 * Run with: node test-login-api.js
 * 
 * Make sure the dev server is running on localhost:3000
 */

const testCredentials = {
  landlord: {
    username: 'landlord_test', // Update with actual landlord username
    password: 'password123'     // Update with actual password
  },
  tenant: {
    username: 'tenant_test',    // Update with actual tenant username
    password: 'password123'     // Update with actual password
  }
};

async function testCheckRole(username, password, expectedRole) {
  console.log(`\n🧪 Testing check-role API for ${expectedRole}...`);
  console.log(`   Username: ${username}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/check-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (data.success) {
      if (expectedRole === 'landlord' && data.allowLogin) {
        console.log('   ✅ PASS: Landlord can login');
      } else if (expectedRole === 'tenant' && !data.allowLogin) {
        console.log('   ✅ PASS: Tenant redirected');
        console.log(`   Redirect URL: ${data.redirectUrl}`);
      } else {
        console.log('   ❌ FAIL: Unexpected role behavior');
      }
    } else {
      console.log('   ❌ FAIL: API returned error');
    }
    
    return data;
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 Starting Login API Tests');
  console.log('='.repeat(60));
  console.log('\n⚠️  Make sure to update test credentials in this file!');
  console.log('⚠️  Make sure dev server is running on localhost:3000\n');
  
  // Test 1: Landlord login check
  await testCheckRole(
    testCredentials.landlord.username,
    testCredentials.landlord.password,
    'landlord'
  );
  
  // Test 2: Tenant login check
  await testCheckRole(
    testCredentials.tenant.username,
    testCredentials.tenant.password,
    'tenant'
  );
  
  // Test 3: Invalid credentials
  console.log('\n🧪 Testing invalid credentials...');
  await testCheckRole('invalid_user', 'wrong_password', 'none');
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Tests completed!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. If tests pass, try logging in through the browser');
  console.log('2. Check browser console for any errors');
  console.log('3. Verify session persistence after page reload');
  console.log('4. Test tenant redirection to tenant app\n');
}

// Run tests
runTests().catch(console.error);
