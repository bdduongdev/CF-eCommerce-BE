# API Thanh Toán Đơn Hàng

## Tổng quan
Hệ thống cung cấp các API để tạo đơn hàng và xử lý thanh toán cho trang chi tiết sản phẩm.

## 1. Tạo Đơn Hàng

### 1.1 Tạo đơn hàng từ giỏ hàng
**POST** `/api/orders/from-cart`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "shipping_address": {
    "fullname": "Nguyễn Văn A",
    "phone": "0123456789",
    "street": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "country": "Việt Nam"
  },
  "payment_method": "cod",
  "coupon_code": "SAVE10",
  "note": "Giao hàng giờ hành chính"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "order": {
      "_id": "order_id",
      "order_number": "ORD1234567890123",
      "user_id": "user_id",
      "total_amount": 1500000,
      "status": "pending",
      "payment_status": "pending"
    },
    "order_details": [...]
  }
}
```

### 1.2 Tạo đơn hàng trực tiếp (Buy Now)
**POST** `/api/orders/direct`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "variant_id": "variant_id",
  "quantity": 2,
  "shipping_address": {
    "fullname": "Nguyễn Văn A",
    "phone": "0123456789",
    "street": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "country": "Việt Nam"
  },
  "payment_method": "credit_card",
  "note": "Giao hàng nhanh"
}
```

## 2. Thanh Toán

### 2.1 Xử lý thanh toán
**POST** `/api/payments/{orderId}/process`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### COD (Cash on Delivery)
```json
{
  "payment_method": "cod",
  "payment_details": {}
}
```

#### Chuyển khoản ngân hàng
```json
{
  "payment_method": "bank_transfer",
  "payment_details": {
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "transaction_id": "TXN123456789"
  }
}
```

#### Thẻ tín dụng
```json
{
  "payment_method": "credit_card",
  "payment_details": {
    "card_number": "1234567890123456",
    "expiry_date": "12/25",
    "cvv": "123",
    "cardholder_name": "NGUYEN VAN A"
  }
}
```

#### MoMo
```json
{
  "payment_method": "momo",
  "payment_details": {
    "phone_number": "0123456789",
    "otp": "123456"
  }
}
```

#### VNPay
```json
{
  "payment_method": "vnpay",
  "payment_details": {
    "return_url": "https://your-domain.com/payment/callback"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "order_id": "order_id",
    "order_number": "ORD1234567890123",
    "payment_method": "credit_card",
    "amount": 1500000,
    "payment_details": {
      "method": "credit_card",
      "transaction_id": "TXN123456789",
      "card_last4": "3456",
      "status": "completed"
    }
  }
}
```

### 2.2 Lấy lịch sử thanh toán
**GET** `/api/payments/{orderId}/history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy lịch sử thanh toán thành công",
  "data": {
    "order_id": "order_id",
    "order_number": "ORD1234567890123",
    "payments": [
      {
        "_id": "payment_id",
        "amount": 1500000,
        "payment_method": "credit_card",
        "payment_date": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2.3 Hoàn tiền
**POST** `/api/payments/{orderId}/refund`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Sản phẩm bị lỗi",
  "amount": 1500000
}
```

## 3. Quản Lý Đơn Hàng

### 3.1 Lấy danh sách đơn hàng
**GET** `/api/orders?page=1&limit=10&status=pending`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Trang hiện tại (mặc định: 1)
- `limit`: Số lượng item mỗi trang (mặc định: 10)
- `status`: Lọc theo trạng thái (optional)

### 3.2 Lấy chi tiết đơn hàng
**GET** `/api/orders/{orderId}`

**Headers:**
```
Authorization: Bearer <access_token>
```

### 3.3 Hủy đơn hàng
**PATCH** `/api/orders/{orderId}/cancel`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Thay đổi ý định mua hàng"
}
```

## 4. Phương Thức Thanh Toán

| Method | Mô tả | Yêu cầu |
|--------|-------|---------|
| `cod` | Thanh toán khi nhận hàng | Không cần thông tin bổ sung |
| `bank_transfer` | Chuyển khoản ngân hàng | bank_name, account_number, transaction_id |
| `credit_card` | Thẻ tín dụng | card_number, expiry_date, cvv, cardholder_name |
| `momo` | Ví MoMo | phone_number, otp |
| `vnpay` | Cổng thanh toán VNPay | return_url |

## 5. Trạng Thái Đơn Hàng

| Status | Mô tả |
|--------|-------|
| `pending` | Chờ xử lý |
| `confirmed` | Đã xác nhận |
| `processing` | Đang xử lý |
| `shipped` | Đã giao hàng |
| `delivered` | Đã nhận hàng |
| `cancelled` | Đã hủy |
| `returned` | Đã trả hàng |

## 6. Trạng Thái Thanh Toán

| Status | Mô tả |
|--------|-------|
| `pending` | Chờ thanh toán |
| `paid` | Đã thanh toán |
| `failed` | Thanh toán thất bại |
| `refunded` | Đã hoàn tiền |

## 7. Lưu Ý

1. **Authentication**: Tất cả API yêu cầu JWT token hợp lệ
2. **Validation**: Dữ liệu đầu vào được validate nghiêm ngặt
3. **Stock Management**: Hệ thống tự động cập nhật tồn kho khi tạo đơn hàng
4. **Payment Integration**: Các phương thức thanh toán hiện tại là mô phỏng, cần tích hợp thực tế cho production
5. **Error Handling**: Tất cả lỗi được trả về với format chuẩn 