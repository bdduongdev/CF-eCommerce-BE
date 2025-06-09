import mongoose from "mongoose";
import { DB_URI } from "../configs/enviroments.js";
import seedCategories from "./CategorySeeder.js";
import seedUsers from "./UserSeeder.js";
import seedStorages from "./StorageSeeder.js";
import seedColors from "./ColorSeeder.js";
import seedProducts from "./ProductSeeder.js";
import seedBanners from "./BannerSeeder.js";
import seedDiscounts from "./DiscountSeeder.js";
import seedOrders from "./OrderSeeder.js";
import seedReviews from "./ReviewSeeder.js";
import "../models/PasswordResetToken.js";

const seedAll = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Kết nối database thành công để seed dữ liệu");
    
    // await mongoose.connection.db.dropDatabase();
    // console.log("Đã xóa database cũ");
    
    // Seed dữ liệu cơ bản trước
    await seedCategories(10);
    // await seedUsers(10);
    await seedStorages(5);
    await seedColors(6);
    
    // Seed dữ liệu phụ thuộc sau
    await seedProducts(20);
    await seedBanners(5);
    await seedDiscounts(10);
    await seedOrders(15);
    await seedReviews(50);
    
    console.log("Đã hoàn thành việc seed dữ liệu");
    process.exit(0);
  } catch (error) {
    console.error(`Lỗi khi seed dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

seedAll();