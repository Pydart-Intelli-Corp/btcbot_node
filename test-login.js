const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@btcbot24.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.data.token);
      console.log('User:', data.data.user);
      
      // Test admin endpoint with token
      console.log('\nTesting admin endpoint...');
      const adminResponse = await fetch('http://localhost:5000/api/admin/referrals?page=1&search=', {
        headers: {
          'Authorization': `Bearer ${data.data.token}`
        }
      });
      
      const adminData = await adminResponse.json();
      console.log('Admin endpoint response:', adminResponse.status, adminData);
      
    } else {
      console.log('❌ Login failed:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();