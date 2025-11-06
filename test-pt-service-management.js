// Test PT Service Management API
const API_BASE = 'http://localhost:8080/api';

// Test login to get token (using existing credentials)
async function testLogin() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful');
      return data.token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

// Test PT Service CRUD operations
async function testPTServiceManagement() {
  console.log('\n🧪 Testing PT Service Management API...\n');
  
  const token = await testLogin();
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // Test 1: Get all PT services
    console.log('1️⃣ Testing GET all PT services...');
    const getResponse = await fetch(`${API_BASE}/trainer/pt-services`, {
      headers
    });
    
    if (getResponse.ok) {
      const services = await getResponse.json();
      console.log(`✅ Found ${services.length} PT services`);
      console.log('Sample service:', services[0] || 'No services found');
    } else {
      console.log('❌ Failed to get PT services:', getResponse.status);
    }

    // Test 2: Create a new PT service
    console.log('\n2️⃣ Testing CREATE PT service...');
    const newService = {
      ptName: 'Test PT Package',
      ptCount: 10,
      ptDurationDays: 30,
      ptPrice: 500000,
      ptSalePrice: 400000,
      ptPicUrl: 'https://example.com/test-image.jpg'
    };

    const createResponse = await fetch(`${API_BASE}/trainer/pt-services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newService)
    });

    if (createResponse.ok) {
      const createdService = await createResponse.json();
      console.log('✅ PT service created successfully:', createdService);
      
      // Test 3: Update the created service
      console.log('\n3️⃣ Testing UPDATE PT service...');
      const updatedService = { ...newService, ptName: 'Updated PT Package' };
      
      const updateResponse = await fetch(`${API_BASE}/trainer/pt-services/${createdService.ptId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedService)
      });

      if (updateResponse.ok) {
        console.log('✅ PT service updated successfully');
      } else {
        console.log('❌ Failed to update PT service:', updateResponse.status);
      }

      // Test 4: Delete the created service
      console.log('\n4️⃣ Testing DELETE PT service...');
      const deleteResponse = await fetch(`${API_BASE}/trainer/pt-services/${createdService.ptId}`, {
        method: 'DELETE',
        headers
      });

      if (deleteResponse.ok) {
        console.log('✅ PT service deleted successfully');
      } else {
        console.log('❌ Failed to delete PT service:', deleteResponse.status);
      }
    } else {
      console.log('❌ Failed to create PT service:', createResponse.status);
      const errorText = await createResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testPTServiceManagement();