const axios = require('axios');

async function testPatch() {
  try {
    console.log('Testing PATCH request to update product stock...');
    
    // First, get a product to see its current state
    const getProductResponse = await axios.get('https://gkproject2-0866.vercel.app/api/products/1');
    console.log('Current product data:', getProductResponse.data);
    
    // Try to update the product's stock status
    const patchResponse = await axios.patch('https://gkproject2-0866.vercel.app/api/products/1', {
      inStock: false
    });
    
    console.log('PATCH response:', patchResponse.data);
    
    // Verify the update by getting the product again
    const verifyResponse = await axios.get('https://gkproject2-0866.vercel.app/api/products/1');
    console.log('Updated product data:', verifyResponse.data);
    
  } catch (error) {
    console.error('Error testing PATCH request:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testPatch();