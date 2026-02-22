import axios from 'axios';

// Test the fixed connection check
async function testConnectionFix() {
  console.log('🔍 Testing Connection Fix...\n');

  try {
    // This is what the OLD code was doing (WRONG - causes 404)
    console.log('❌ OLD Method (BROKEN):');
    try {
      const oldResponse = await axios.get('http://localhost:5001/api/');
      console.log('   Response:', oldResponse.data);
    } catch (error) {
      console.log('   Error:', error.response?.status, error.response?.statusText);
      console.log('   Message:', error.response?.data || error.message);
    }

    console.log('\n✅ NEW Method (FIXED):');
    // This is what the NEW code does (CORRECT)
    const newResponse = await axios.get('http://localhost:5001/');
    console.log('   Response:', newResponse.data);
    console.log('   Status:', newResponse.status, newResponse.statusText);

    console.log('\n🎉 Connection test PASSED! The fix works correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnectionFix();
