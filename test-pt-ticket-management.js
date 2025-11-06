// Test script to verify PT ticket management functionality
// Run this in browser console when logged in as TRAINER

async function testPtTicketManagement() {
  console.log('🧪 Testing PT ticket management functionality...');
  
  // Check authentication
  const token = localStorage.getItem('jwt');
  console.log('Token exists:', !!token);
  
  if (!token) {
    console.error('❌ No JWT token found. Please log in first.');
    return;
  }
  
  const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || '';
  
  try {
    // Test 1: Get current user info to verify TRAINER role
    console.log('📋 Testing user authentication...');
    const userResponse = await fetch(`${SERVER_ORIGIN}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!userResponse.ok) {
      console.error('❌ Authentication failed:', userResponse.status);
      return;
    }
    
    const user = await userResponse.json();
    console.log('✅ Authenticated user:', user.email, 'Role:', user.role);
    
    if (user.role !== 'TRAINER' && user.role !== 'ADMIN') {
      console.error('❌ User must be TRAINER or ADMIN to test PT ticket management');
      return;
    }
    
    // Test 2: Get PT tickets list
    console.log('📋 Getting PT tickets list...');
    const ticketsResponse = await fetch(`${SERVER_ORIGIN}/api/trainer/pt-tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!ticketsResponse.ok) {
      console.error('❌ Failed to get PT tickets:', ticketsResponse.status);
      const errorText = await ticketsResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const tickets = await ticketsResponse.json();
    console.log('✅ PT tickets list:', tickets.length, 'tickets found');
    console.log('📝 Tickets:', tickets);
    
    // Test 3: Create a new PT ticket
    console.log('➕ Creating new PT ticket...');
    const newTicket = {
      ptName: 'Test PT Ticket',
      ptCount: 10,
      price: 100000,
      salePrice: 80000,
      description: 'Test ticket for verification'
    };
    
    const createResponse = await fetch(`${SERVER_ORIGIN}/api/trainer/pt-tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTicket)
    });
    
    if (!createResponse.ok) {
      console.error('❌ Failed to create PT ticket:', createResponse.status);
      const errorText = await createResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const createdTicket = await createResponse.json();
    console.log('✅ Created PT ticket:', createdTicket);
    
    const ticketId = createdTicket.ptTicketId;
    
    // Test 4: Update the PT ticket
    console.log('✏️ Updating PT ticket...');
    const updateData = {
      ptName: 'Updated Test PT Ticket',
      ptCount: 15,
      price: 120000,
      salePrice: 90000,
      description: 'Updated test ticket'
    };
    
    const updateResponse = await fetch(`${SERVER_ORIGIN}/api/trainer/pt-tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      console.error('❌ Failed to update PT ticket:', updateResponse.status);
      const errorText = await updateResponse.text();
      console.error('Error details:', errorText);
    } else {
      const updatedTicket = await updateResponse.json();
      console.log('✅ Updated PT ticket:', updatedTicket);
    }
    
    // Test 5: Get updated list
    console.log('📋 Getting updated PT tickets list...');
    const updatedTicketsResponse = await fetch(`${SERVER_ORIGIN}/api/trainer/pt-tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (updatedTicketsResponse.ok) {
      const updatedTickets = await updatedTicketsResponse.json();
      console.log('✅ Updated PT tickets list:', updatedTickets.length, 'tickets found');
    }
    
    // Test 6: Delete the test ticket (optional - comment out if you want to keep it)
    console.log('🗑️ Deleting test PT ticket...');
    const deleteResponse = await fetch(`${SERVER_ORIGIN}/api/trainer/pt-tickets/${ticketId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!deleteResponse.ok) {
      console.error('❌ Failed to delete PT ticket:', deleteResponse.status);
      const errorText = await deleteResponse.text();
      console.error('Error details:', errorText);
    } else {
      console.log('✅ PT ticket deleted successfully');
    }
    
    console.log('🎉 PT ticket management test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPtTicketManagement();