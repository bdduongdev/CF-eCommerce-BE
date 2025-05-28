import Order from "../models/Order.js";
import User from "../models/User.js";
import { faker } from '@faker-js/faker';

const seedOrders = async (count = 15) => {
  try {
    await Order.deleteMany();
    console.log("Đã xóa dữ liệu Order cũ");

    // Lấy danh sách người dùng từ database (chỉ lấy customer)
    const customers = await User.find({ role: "customer" });

    if (customers.length === 0) {
      console.log("Không có khách hàng nào để tạo đơn hàng");
      return false;
    }

    const orders = [];
    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    for (let i = 0; i < count; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const orderDate = faker.date.recent({ days: 30 });
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      orders.push({
        user_id: randomCustomer._id,
        order_date: orderDate,
        total_amount: faker.number.int({ min: 500000, max: 20000000 }),
        status: status
      });
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