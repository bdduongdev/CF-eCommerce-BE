import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const TEST_PRODUCT_IDS = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']; // Example product IDs

// Test functions
const testGetAllDiscounts = async () => {
  try {
    console.log('Testing GET /discounts...');
    const response = await axios.get(`${BASE_URL}/discounts`);
    console.log('✅ Get all discounts:', response.data.success);
    return response.data;
  } catch (error) {
    console.log('❌ Get all discounts failed:', error.response?.data || error.message);
  }
};

const testGetActiveDiscounts = async () => {
  try {
    console.log('Testing GET /discounts/active...');
    const response = await axios.get(`${BASE_URL}/discounts/active`);
    console.log('✅ Get active discounts:', response.data.success);
    return response.data;
  } catch (error) {
    console.log('❌ Get active discounts failed:', error.response?.data || error.message);
  }
};

const testGetDiscountsByProduct = async () => {
  try {
    console.log('Testing GET /discounts/product/:product_id...');
    const response = await axios.get(`${BASE_URL}/discounts/product/${TEST_PRODUCT_IDS[0]}`);
    console.log('✅ Get discounts by product:', response.data.success);
    return response.data;
  } catch (error) {
    console.log('❌ Get discounts by product failed:', error.response?.data || error.message);
  }
};

const testCreateDiscount = async (token) => {
  try {
    console.log('Testing POST /discounts...');
    const discountData = {
      product_ids: TEST_PRODUCT_IDS.slice(0, 2), // Use first 2 product IDs
      discount_type: 'percentage',
      discount_value: 15,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      description: 'Test discount 15% off for multiple products',
      is_active: true
    };

    const response = await axios.post(`${BASE_URL}/discounts`, discountData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Create discount:', response.data.success);
    return response.data.data._id;
  } catch (error) {
    console.log('❌ Create discount failed:', error.response?.data || error.message);
  }
};

const testUpdateDiscount = async (discountId, token) => {
  try {
    console.log('Testing PUT /discounts/:id...');
    const updateData = {
      discount_value: 20,
      description: 'Updated test discount 20% off for multiple products'
    };

    const response = await axios.put(`${BASE_URL}/discounts/${discountId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Update discount:', response.data.success);
  } catch (error) {
    console.log('❌ Update discount failed:', error.response?.data || error.message);
  }
};

const testAddProductsToDiscount = async (discountId, token) => {
  try {
    console.log('Testing POST /discounts/:id/products...');
    const productData = {
      product_ids: [TEST_PRODUCT_IDS[2]] // Add third product
    };

    const response = await axios.post(`${BASE_URL}/discounts/${discountId}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Add products to discount:', response.data.success);
  } catch (error) {
    console.log('❌ Add products to discount failed:', error.response?.data || error.message);
  }
};

const testRemoveProductsFromDiscount = async (discountId, token) => {
  try {
    console.log('Testing DELETE /discounts/:id/products...');
    const productData = {
      product_ids: [TEST_PRODUCT_IDS[0]] // Remove first product
    };

    const response = await axios.delete(`${BASE_URL}/discounts/${discountId}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: productData
    });
    console.log('✅ Remove products from discount:', response.data.success);
  } catch (error) {
    console.log('❌ Remove products from discount failed:', error.response?.data || error.message);
  }
};

const testDeleteDiscount = async (discountId, token) => {
  try {
    console.log('Testing DELETE /discounts/:id...');
    const response = await axios.delete(`${BASE_URL}/discounts/${discountId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Delete discount:', response.data.success);
  } catch (error) {
    console.log('❌ Delete discount failed:', error.response?.data || error.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Discount API Tests (Many-to-Many)...\n');

  // Test public endpoints
  await testGetAllDiscounts();
  await testGetActiveDiscounts();
  await testGetDiscountsByProduct();

  console.log('\n📝 Note: Admin endpoints require authentication token');
  console.log('To test admin endpoints, provide a valid JWT token with admin role');

  // Uncomment and provide a valid admin token to test admin endpoints
  /*
  const adminToken = 'your_admin_jwt_token_here';
  const discountId = await testCreateDiscount(adminToken);
  if (discountId) {
    await testUpdateDiscount(discountId, adminToken);
    await testAddProductsToDiscount(discountId, adminToken);
    await testRemoveProductsFromDiscount(discountId, adminToken);
    await testDeleteDiscount(discountId, adminToken);
  }
  */

  console.log('\n✅ Discount API Tests completed!');
  console.log('\n🔧 New Features:');
  console.log('- Many-to-many relationship between discounts and products');
  console.log('- Add/remove products from existing discounts');
  console.log('- Support for multiple products per discount');
  console.log('- Improved filtering and aggregation');
};

// Run tests
runTests().catch(console.error); 