import Order from "../models/Order.js";
import User from "../models/User.js";
import { faker } from '@faker-js/faker';

const seedOrders = async (count = 15) => {
  try {
    await Order.deleteMany();
    console.log("Đã xóa dữ liệu Order cũ");

    const customers = await User.find({ role: "customer" });

    if (customers.length === 0) {
      console.log("Không có khách hàng nào để tạo đơn hàng");
      return false;
    }

    const orders = [];
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay'];
    const paymentStatuses = ['pending', 'paid', 'failed'];
    const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
    const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng'];
    const wards = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'];

    for (let i = 0; i < count; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const orderDate = faker.date.recent({ days: 30 });
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Tạo order_number
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `ORD${timestamp}${random}`;
      
      // Tính toán giá
      const subtotal = faker.number.int({ min: 500000, max: 20000000 });
      const discountAmount = faker.number.int({ min: 0, max: subtotal * 0.2 }); // Giảm tối đa 20%
      const shippingFee = faker.number.int({ min: 0, max: 50000 });
      const totalAmount = subtotal - discountAmount + shippingFee;

      // Tạo địa chỉ giao hàng
      const city = cities[Math.floor(Math.random() * cities.length)];
      const district = districts[Math.floor(Math.random() * districts.length)];
      const ward = wards[Math.floor(Math.random() * wards.length)];

      const order = {
        user_id: randomCustomer._id,
        order_number: orderNumber,
        order_date: orderDate,
        shipping_address: {
          fullname: faker.person.fullName(),
          phone: faker.phone.number('0#########'),
          street: faker.location.streetAddress(),
          ward: ward,
          district: district,
          city: city,
          country: "Việt Nam"
        },
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        subtotal: subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        status: status,
        note: faker.helpers.arrayElement([
          null,
          "Giao hàng giờ hành chính",
          "Gọi trước khi giao",
          "Để ở cổng",
          "Giao hàng nhanh"
        ])
      };

      // Thêm thông tin bổ sung tùy theo trạng thái
      if (status === 'shipped' || status === 'delivered') {
        order.tracking_number = faker.string.alphanumeric(10).toUpperCase();
        order.estimated_delivery = faker.date.future({ years: 0.1 });
      }

      if (status === 'delivered') {
        order.delivered_at = faker.date.recent({ days: 7 });
      }

      if (status === 'cancelled') {
        order.cancelled_at = faker.date.recent({ days: 5 });
        order.cancelled_reason = faker.helpers.arrayElement([
          "Khách hàng hủy",
          "Hết hàng",
          "Địa chỉ không hợp lệ",
          "Không liên lạc được"
        ]);
      }

      orders.push(order);
    }

    await Order.insertMany(orders);
    console.log(`Đã thêm ${orders.length} đơn hàng mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Order: ${error.message}`);
    return false;
  }
};

export default seedOrders;