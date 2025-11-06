// Test script to verify view count functionality
// Run this in browser console when logged in

async function testViewCount() {
  console.log('🧪 Testing view count functionality...');
  
  // Check authentication
  const token = localStorage.getItem('jwt');
  console.log('Token exists:', !!token);
  
  if (!token) {
    console.error('❌ No JWT token found. Please log in first.');
    return;
  }
  
  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || '';
  
  try {
    // Test 1: Get current user info
    console.log('📋 Testing user authentication...');
    const userResponse = await fetch(`${SERVER_ORIGIN}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!userResponse.ok) {
      console.error('❌ Authentication failed:', userResponse.status);
      return;
    }
    
    const user = await userResponse.json();
    console.log('✅ Authenticated user:', user.email, 'ID:', user.uId);
    
    // Test 2: Get a sample board post to test with
    console.log('📋 Getting board list...');
    const boardsResponse = await fetch(`${SERVER_ORIGIN}/api/boards`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!boardsResponse.ok) {
      console.error('❌ Failed to get boards:', boardsResponse.status);
      return;
    }
    
    const boards = await boardsResponse.json();
    if (!boards || boards.length === 0) {
      console.error('❌ No boards found to test with');
      return;
    }
    
    const testBoard = boards[0];
    console.log('📝 Testing with board:', testBoard.pid, testBoard.ptitle);
    
    // Test 3: Check current view count before
    console.log('📊 Getting initial board details...');
    const detailResponse1 = await fetch(`${SERVER_ORIGIN}/api/boards/${testBoard.pid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!detailResponse1.ok) {
      console.error('❌ Failed to get board details:', detailResponse1.status);
      return;
    }
    
    const boardDetails1 = await detailResponse1.json();
    console.log('📊 Initial view count:', boardDetails1.pviewcount);
    
    // Test 4: Try the separate view endpoint
    console.log('👁️ Testing separate view endpoint...');
    const viewResponse = await fetch(`${SERVER_ORIGIN}/api/boards/${testBoard.pid}/view`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (viewResponse.ok) {
      console.log('✅ View endpoint successful');
    } else {
      console.error('❌ View endpoint failed:', viewResponse.status);
      const errorText = await viewResponse.text();
      console.error('Error details:', errorText);
    }
    
    // Test 5: Check view count after
    console.log('📊 Getting final board details...');
    const detailResponse2 = await fetch(`${SERVER_ORIGIN}/api/boards/${testBoard.pid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (detailResponse2.ok) {
      const boardDetails2 = await detailResponse2.json();
      console.log('📊 Final view count:', boardDetails2.pviewcount);
      
      const viewCountChanged = boardDetails2.pviewcount > boardDetails1.pviewcount;
      console.log(viewCountChanged ? '✅ View count incremented!' : '❌ View count did not change');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testViewCount();