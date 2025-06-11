import Category from "../models/Category.js";

const seedCategories = async () => {
  try {
    await Category.deleteMany();
    console.log("Đã xóa dữ liệu Category cũ");

    const now = new Date();
    
    const categories = [
      {
        category_name: "iPhone",
        created_at: now,
        updated_at: now
      },
      {
        category_name: "iPad",
        created_at: now,
        updated_at: now
      },
      {
        category_name: "MacBook",
        created_at: now,
        updated_at: now
      },
      {
        category_name: "Apple Watch",
        created_at: now,
        updated_at: now
      },
      {
        category_name: "AirPods",
        created_at: now,
        updated_at: now
      },
      {
        category_name: "Phụ kiện",
        created_at: now,
        updated_at: now
      }
    ];

    await Category.insertMany(categories);
    console.log(`Đã thêm ${categories.length} danh mục mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Category: ${error.message}`);
    return false;
  }
};

export default seedCategories;
