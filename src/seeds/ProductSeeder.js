import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";
import { faker } from '@faker-js/faker';
import mongoose from "mongoose";

const seedProducts = async (count = 20) => {
  try {
    await Product.deleteMany();
    console.log("Đã xóa dữ liệu Product cũ");

    // Lấy danh sách categories, colors và storages từ database
    const categories = await Category.find();
    const colors = await ProductColor.find();
    const storages = await ProductStorage.find();

    // Kiểm tra xem có đủ dữ liệu để tạo sản phẩm không
    if (categories.length === 0 || colors.length === 0 || storages.length === 0) {
      console.log("Không đủ dữ liệu categories, colors hoặc storages để tạo sản phẩm");
      return false;
    }

    const products = [];

    for (let i = 0; i < count; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomStorage = storages[Math.floor(Math.random() * storages.length)];
      
      const now = new Date();
      const productName = faker.commerce.productName();
      
      products.push({
        product_name: productName,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 1000000, max: 30000000 })),
        stock_quantity: faker.number.int({ min: 5, max: 100 }),
        category_id: randomCategory._id,
        color_id: randomColor._id,
        storage_id: randomStorage._id,
        image_url: faker.image.url(),
        created_at: now,
        updated_at: now
      });
    }

    await Product.insertMany(products);
    console.log(`Đã thêm ${products.length} sản phẩm mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Product: ${error.message}`);
    return false;
  }
};

export default seedProducts;