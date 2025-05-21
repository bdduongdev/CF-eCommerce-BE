import Category from "../models/category.js";
import { faker } from '@faker-js/faker';

const seedCategories = async (count = 10) => {
  try {
    await Category.deleteMany();
    console.log("Đã xóa dữ liệu Category cũ");

    const categories = [];

    for (let i = 0; i < count; i++) {
      const name = faker.commerce.department();
      const now = new Date();

      categories.push({
        category_name: name,
        created_at: now,
        updated_at: now
      });
    }

    await Category.insertMany(categories);
    console.log(`Đã thêm ${count} danh mục mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Category: ${error.message}`);
    return false;
  }
};

export default seedCategories;
