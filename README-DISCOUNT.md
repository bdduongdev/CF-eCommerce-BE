# Discount Management System

## Overview
The Discount Management System is a comprehensive API for managing product discounts in the e-commerce platform. It provides full CRUD operations, filtering, and status management for discounts.

## Features

### Core Functionality
- ✅ **Create Discounts**: Support for both percentage and fixed amount discounts
- ✅ **Read Discounts**: Get all discounts with filtering and pagination
- ✅ **Update Discounts**: Modify existing discount details
- ✅ **Delete Discounts**: Remove discounts from the system
- ✅ **Status Management**: Automatic status calculation (active, expired, upcoming)
- ✅ **Product Association**: Link discounts to specific products or make them general

### Advanced Features
- 🔍 **Filtering**: Filter by product, discount type, and status
- 📄 **Pagination**: Built-in pagination support
- 🔐 **Authentication**: Role-based access control
- ✅ **Validation**: Comprehensive input validation
- 📊 **Status Tracking**: Real-time status calculation

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/discounts` - Get all discounts with filtering
- `GET /api/discounts/active` - Get currently active discounts
- `GET /api/discounts/product/:product_id` - Get active discounts for a product
- `GET /api/discounts/:id` - Get discount by ID

### Admin Endpoints (Require Admin Role)
- `POST /api/discounts` - Create new discount
- `PUT /api/discounts/:id` - Update existing discount
- `DELETE /api/discounts/:id` - Delete discount

## Database Schema

### Discount Model
```javascript
{
  product_id: ObjectId (optional), // Reference to Product
  discount_type: String, // 'percentage' or 'fixed'
  discount_value: Number, // Discount amount/percentage
  start_date: Date, // When discount starts
  end_date: Date, // When discount ends
  description: String (optional), // Discount description
  created_at: Date, // Auto-generated timestamp
  updated_at: Date // Auto-generated timestamp
}
```

## Installation & Setup

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Existing e-commerce project setup

### 2. Files Added
The following files have been added to the project:

```
src/
├── models/
│   └── Discount.js (existing)
├── controllers/
│   └── DiscountController.js (new)
├── routes/
│   └── DiscountRoutes.js (new)
├── validations/
│   └── discount.validation.js (new)
├── seeds/
│   └── DiscountSeeder.js (new)
└── constants/
    └── index.js (updated with discount messages)

docs/
└── discount-api.md (new)

test-discount-api.js (new)
README-DISCOUNT.md (this file)
```

### 3. Database Setup
Run the seeder to populate sample discount data:

```bash
npm run seed
```

Or run the discount seeder specifically:

```bash
node src/seeds/DiscountSeeder.js
```

### 4. Start the Server
```bash
npm start
```

## Usage Examples

### Create a Percentage Discount
```javascript
const discountData = {
  product_id: "product_id_here",
  discount_type: "percentage",
  discount_value: 20,
  start_date: "2024-01-01T00:00:00.000Z",
  end_date: "2024-12-31T23:59:59.000Z",
  description: "Giảm giá 20% cho iPhone 15 Pro"
};

const response = await fetch('/api/discounts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(discountData)
});
```

### Get Active Discounts
```javascript
const response = await fetch('/api/discounts/active');
const data = await response.json();
console.log(data.data.discounts);
```

### Filter Discounts
```javascript
const response = await fetch('/api/discounts?discount_type=percentage&status=active&limit=5');
const data = await response.json();
console.log(data.data.discounts);
```

## Validation Rules

### Create Discount
- `discount_type`: Required, must be 'percentage' or 'fixed'
- `discount_value`: Required, must be positive number
- `start_date`: Required, must be valid date
- `end_date`: Required, must be after start_date
- `discount_value`: For percentage type, cannot exceed 100
- `product_id`: If provided, must reference existing product

### Update Discount
- All fields are optional
- Same validation rules as create
- At least one field must be provided

## Status Calculation

The system automatically calculates discount status based on current date:

- **Active**: Current date is between start_date and end_date
- **Expired**: Current date is after end_date
- **Upcoming**: Current date is before start_date

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

## Testing

### Run Test Script
```bash
node test-discount-api.js
```

### Manual Testing with curl
```bash
# Get all discounts
curl -X GET http://localhost:3000/api/discounts

# Get active discounts
curl -X GET http://localhost:3000/api/discounts/active

# Create discount (requires admin token)
curl -X POST http://localhost:3000/api/discounts \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_type": "percentage",
    "discount_value": 15,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "description": "Test discount"
  }'
```

## Integration with Existing System

### Product Integration
- Discounts can be linked to specific products
- Product information is populated in discount responses
- Product validation ensures data integrity

### Authentication Integration
- Uses existing JWT authentication system
- Integrates with role-based access control
- Admin-only operations for sensitive actions

### Error Handling Integration
- Uses existing error handling utilities
- Consistent error response format
- Vietnamese language support

## Security Considerations

1. **Authentication**: All admin operations require valid JWT token
2. **Authorization**: Admin role required for create/update/delete operations
3. **Input Validation**: Comprehensive validation prevents invalid data
4. **Data Integrity**: Foreign key constraints ensure data consistency

## Performance Considerations

1. **Indexing**: Consider adding indexes on frequently queried fields
2. **Pagination**: Built-in pagination prevents large data loads
3. **Population**: Efficient product data population
4. **Caching**: Consider implementing caching for frequently accessed discounts

## Future Enhancements

### Potential Features
- [ ] Bulk discount operations
- [ ] Discount templates
- [ ] Advanced scheduling (recurring discounts)
- [ ] Discount analytics and reporting
- [ ] Email notifications for discount changes
- [ ] Discount usage tracking
- [ ] Coupon code integration

### Technical Improvements
- [ ] Redis caching for active discounts
- [ ] Database indexing optimization
- [ ] API rate limiting
- [ ] Webhook support for discount events

## Troubleshooting

### Common Issues

1. **Validation Errors**
   - Check that all required fields are provided
   - Ensure date formats are correct
   - Verify percentage values don't exceed 100

2. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Verify user has admin role for protected operations

3. **Product Not Found**
   - Ensure product_id references an existing product
   - Check that products are seeded in the database

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=discount:* npm start
```

## Support

For issues or questions regarding the Discount Management System:

1. Check the API documentation in `docs/discount-api.md`
2. Review the test script in `test-discount-api.js`
3. Check server logs for error details
4. Verify database connectivity and data integrity

## License

This discount management system is part of the CF-eCommerce-BE project and follows the same licensing terms. 