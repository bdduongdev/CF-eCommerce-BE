# Discount Management API Documentation

## Overview
The Discount Management API provides endpoints for managing product discounts in the e-commerce system. This includes creating, reading, updating, and deleting discounts, as well as managing product associations through a many-to-many relationship.

## Base URL
```
/api/discounts
```

## Authentication
- Public endpoints: No authentication required
- Protected endpoints: Require JWT token
- Admin endpoints: Require admin role

## Data Models

### Discount Object
```json
{
  "_id": "ObjectId",
  "discount_type": "percentage | fixed",
  "discount_value": "number",
  "start_date": "Date",
  "end_date": "Date",
  "description": "string (optional)",
  "is_active": "boolean",
  "created_at": "Date",
  "updated_at": "Date",
  "products": [
    {
      "_id": "ObjectId",
      "product_name": "string",
      "price": "number",
      "image_url": "string"
    }
  ]
}
```

### DiscountProduct Object (Internal)
```json
{
  "_id": "ObjectId",
  "discount_id": "ObjectId",
  "product_id": "ObjectId",
  "created_at": "Date"
}
```

### Discount Status
- `active`: Currently active discount (current date is between start_date and end_date)
- `expired`: Discount has ended (current date is after end_date)
- `upcoming`: Discount hasn't started yet (current date is before start_date)

## Endpoints

### 1. Get All Discounts
**GET** `/api/discounts`

**Description**: Retrieve all discounts with filtering and pagination

**Query Parameters**:
- `product_id` (string, optional): Filter by product ID
- `discount_type` (string, optional): Filter by discount type (`percentage` or `fixed`)
- `status` (string, optional): Filter by status (`active`, `expired`, `upcoming`, `inactive`)
- `limit` (number, optional): Number of items per page (default: 10, max: 100)
- `page` (number, optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "message": "Lấy danh sách giảm giá thành công",
  "data": {
    "discounts": [
      {
        "_id": "discount_id",
        "discount_type": "percentage",
        "discount_value": 15,
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T23:59:59.000Z",
        "description": "Giảm giá 15% cho iPhone 15 Pro",
        "is_active": true,
        "status": "active",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "products": [
          {
            "_id": "product_id",
            "product_name": "iPhone 15 Pro",
            "price": 25000000,
            "image_url": "product_image_url"
          }
        ]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 2. Get Discount by ID
**GET** `/api/discounts/:id`

**Description**: Retrieve a specific discount by its ID

**Parameters**:
- `id` (string, required): Discount ID

**Response**:
```json
{
  "success": true,
  "message": "Lấy thông tin giảm giá thành công",
  "data": {
    "_id": "discount_id",
    "discount_type": "percentage",
    "discount_value": 15,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "description": "Giảm giá 15% cho iPhone 15 Pro",
    "is_active": true,
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "products": [
      {
        "_id": "product_id",
        "product_name": "iPhone 15 Pro",
        "price": 25000000,
        "image_url": "product_image_url"
      }
    ]
  }
}
```

### 3. Create Discount
**POST** `/api/discounts`

**Description**: Create a new discount (Admin only)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "product_ids": ["product_id_1", "product_id_2"],
  "discount_type": "percentage",
  "discount_value": 15,
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-12-31T23:59:59.000Z",
  "description": "Giảm giá 15% cho iPhone 15 Pro",
  "is_active": true
}
```

**Validation Rules**:
- `product_ids`: Array of product IDs (at least 1 required)
- `discount_type`: Required, must be `percentage` or `fixed`
- `discount_value`: Required, must be a positive number
- `start_date`: Required, must be a valid date
- `end_date`: Required, must be after `start_date`
- `discount_value`: For percentage type, must not exceed 100
- `product_ids`: All IDs must reference existing products
- `is_active`: Optional boolean, defaults to true

**Response**:
```json
{
  "success": true,
  "message": "Tạo giảm giá mới thành công",
  "data": {
    "_id": "new_discount_id",
    "discount_type": "percentage",
    "discount_value": 15,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "description": "Giảm giá 15% cho iPhone 15 Pro",
    "is_active": true,
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "products": [
      {
        "_id": "product_id",
        "product_name": "iPhone 15 Pro",
        "price": 25000000,
        "image_url": "product_image_url"
      }
    ]
  }
}
```

### 4. Update Discount
**PUT** `/api/discounts/:id`

**Description**: Update an existing discount (Admin only)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Parameters**:
- `id` (string, required): Discount ID

**Request Body**:
```json
{
  "discount_type": "fixed",
  "discount_value": 500000,
  "description": "Updated description",
  "is_active": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cập nhật giảm giá thành công",
  "data": {
    "_id": "discount_id",
    "discount_type": "fixed",
    "discount_value": 500000,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "description": "Updated description",
    "is_active": false,
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "products": [
      {
        "_id": "product_id",
        "product_name": "iPhone 15 Pro",
        "price": 25000000,
        "image_url": "product_image_url"
      }
    ]
  }
}
```

### 5. Delete Discount
**DELETE** `/api/discounts/:id`

**Description**: Delete a discount (Admin only)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Parameters**:
- `id` (string, required): Discount ID

**Response**:
```json
{
  "success": true,
  "message": "Xóa giảm giá thành công"
}
```

### 6. Get Active Discounts
**GET** `/api/discounts/active`

**Description**: Get all currently active discounts

**Query Parameters**:
- `limit` (number, optional): Number of items per page (default: 10)
- `page` (number, optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "message": "Lấy danh sách giảm giá đang hoạt động thành công",
  "data": {
    "discounts": [
      {
        "_id": "discount_id",
        "discount_type": "percentage",
        "discount_value": 15,
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T23:59:59.000Z",
        "description": "Giảm giá 15% cho iPhone 15 Pro",
        "is_active": true,
        "status": "active",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "products": [
          {
            "_id": "product_id",
            "product_name": "iPhone 15 Pro",
            "price": 25000000,
            "image_url": "product_image_url"
          }
        ]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

### 7. Get Active Discounts for Product
**GET** `/api/discounts/product/:product_id`

**Description**: Get all active discounts for a specific product

**Parameters**:
- `product_id` (string, required): Product ID

**Response**:
```json
{
  "success": true,
  "message": "Lấy danh sách giảm giá đang hoạt động thành công",
  "data": [
    {
      "_id": "discount_id",
      "discount_type": "percentage",
      "discount_value": 15,
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-12-31T23:59:59.000Z",
      "description": "Giảm giá 15% cho iPhone 15 Pro",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 8. Add Products to Discount
**POST** `/api/discounts/:id/products`

**Description**: Add products to an existing discount (Admin only)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Parameters**:
- `id` (string, required): Discount ID

**Request Body**:
```json
{
  "product_ids": ["product_id_1", "product_id_2", "product_id_3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thêm sản phẩm vào giảm giá thành công"
}
```

### 9. Remove Products from Discount
**DELETE** `/api/discounts/:id/products`

**Description**: Remove products from an existing discount (Admin only)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Parameters**:
- `id` (string, required): Discount ID

**Request Body**:
```json
{
  "product_ids": ["product_id_1", "product_id_2"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giảm giá thành công"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Bạn chưa đăng nhập",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Không có quyền truy cập",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy giảm giá",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

## Usage Examples

### Create a Discount with Multiple Products
```bash
curl -X POST http://localhost:3000/api/discounts \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": ["product_id_1", "product_id_2", "product_id_3"],
    "discount_type": "percentage",
    "discount_value": 20,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-12-31T23:59:59.000Z",
    "description": "Giảm giá 20% cho nhiều sản phẩm"
  }'
```

### Add Products to Existing Discount
```bash
curl -X POST http://localhost:3000/api/discounts/discount_id/products \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": ["new_product_id_1", "new_product_id_2"]
  }'
```

### Get Active Discounts for a Product
```bash
curl -X GET http://localhost:3000/api/discounts/product/product_id_here
```

### Filter Discounts by Type
```bash
curl -X GET "http://localhost:3000/api/discounts?discount_type=percentage&status=active&limit=5"
```

## Notes

1. **Many-to-Many Relationship**:
   - One discount can apply to multiple products
   - One product can have multiple discounts
   - Uses DiscountProduct model as junction table

2. **Discount Types**:
   - `percentage`: Discount is applied as a percentage (e.g., 15% off)
   - `fixed`: Discount is applied as a fixed amount (e.g., 500,000 VNĐ off)

3. **Validation**:
   - Percentage discounts cannot exceed 100%
   - End date must be after start date
   - Product IDs must reference existing products
   - At least one product must be assigned to a discount

4. **Status Calculation**:
   - Status is calculated automatically based on current date and discount date range
   - No database field is stored for status; it's computed on-the-fly

5. **Product Management**:
   - Products can be added/removed from discounts without recreating the discount
   - Duplicate product assignments are automatically handled
   - When updating product_ids, all existing associations are replaced

6. **Pagination**:
   - All list endpoints support pagination
   - Default limit is 10 items per page
   - Maximum limit is 100 items per page

7. **Performance**:
   - Uses MongoDB aggregation for efficient queries
   - Compound index on discount_id and product_id for fast lookups
   - Optimized for read-heavy operations 