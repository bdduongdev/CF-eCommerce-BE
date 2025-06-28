import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Discount from './src/models/Discount.js';
import DiscountProduct from './src/models/DiscountProduct.js';
import Product from './src/models/Product.js';

dotenv.config();

const createActiveDiscount = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Đã kết nối với MongoDB');

    // Get some products
    const products = await Product.find({}).limit(3);
    if (products.length === 0) {
      console.log('Không có sản phẩm nào trong database');
      return;
    }

    // Create an active discount
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const activeDiscount = new Discount({
      discount_type: 'percentage',
      discount_value: 25,
      start_date: startDate,
      end_date: endDate,
      description: 'Giảm giá 25% cho tất cả sản phẩm iPhone (ACTIVE)',
      is_active: true
    });

    await activeDiscount.save();
    console.log('Đã tạo discount active:', activeDiscount._id);

    // Create discount-product relationships
    const discountProducts = products.map(product => ({
      discount_id: activeDiscount._id,
      product_id: product._id
    }));

    await DiscountProduct.insertMany(discountProducts);
    console.log(`Đã tạo ${discountProducts.length} discount-product relationships`);

    console.log('Hoàn thành tạo discount active!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

createActiveDiscount(); 