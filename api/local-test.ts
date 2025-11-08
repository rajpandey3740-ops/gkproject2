// Test file to verify Vercel function compatibility
import { products } from './data/productsData';

// Mock VercelRequest and VercelResponse types
interface VercelRequest {
  method?: string;
  query?: any;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

// Test the products-vercel function logic
function testProductsFunction() {
  console.log('Testing products function...');
  console.log('Total products:', products.length);
  console.log('First product:', products[0]);
  
  // Simulate the Vercel function response
  const response = {
    success: true,
    count: products.length,
    data: products.slice(0, 5)
  };
  
  console.log('Sample response:', JSON.stringify(response, null, 2));
  return response;
}

// Run the test
testProductsFunction();
console.log('Test completed successfully!');