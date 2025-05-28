import Discount from "../models/Discount.js";
import Product from "../models/Product.js";
import { faker } from '@faker-js/faker';

const seedDiscounts = async (count = 10) => {
  try {
    await Discount.deleteMany();
    console.log("Đã xóa dữ liệu Discount cũ");

    // Lấy danh sách sản phẩm từ database
    const products = await Product.find();

    if (products.length === 0) {
      console.log("Không có sản phẩm nào để tạo discount");
      return false;
    }

    const discounts = [];
    const discountTypes = ['percentage', 'fixed'];

    for (let i = 0; i < count; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const discountType = discountTypes[Math.floor(Math.random() * discountTypes.length)];
      const now = new Date();
      const startDate = faker.date.recent();
      const endDate = faker.date.future({ refDate: startDate });
      
      // Giá trị giảm giá phù hợp với loại giảm giá
      let discountValue;
      if (discountType === 'percentage') {
        discountValue = faker.number.int({ min: 5, max: 50 }); // 5% đến 50%
      } else {
        discountValue = faker.number.int({ min: 100000, max: 2000000 }); // 100,000 đến 2,000,000 VND
      }

      discounts.push({
        product_id: randomProduct._id,
        discount_type: discountType,
        discount_value: discountValue,
        start_date: startDate,
        end_date: endDate,
        description: faker.commerce.productDescription(),
        created_at: now,
        updated_at: now
      });
    }

    await Discount.insertMany(discounts);
    console.log(`Đã thêm ${discounts.length} discount mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Discount: ${error.message}`);
    return false;
  }
};

export default seedDiscounts;