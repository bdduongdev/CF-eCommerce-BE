import mongoose from "mongoose";
import dotenv from "dotenv";
import seedCategories from "./CategorySeeder.js";
import seedColors from "./ColorSeeder.js";
import seedStorages from "./StorageSeeder.js";
import seedProducts from "./ProductSeeder.js";
import seedUsers from "./UserSeeder.js";
import seedOrders from "./OrderSeeder.js";
import seedOrderDetails from "./OrderDetailSeeder.js";
import { seedDiscounts } from "./DiscountSeeder.js";

dotenv.config();

mongoose
  .connect(process.env.DB_URI)
  .then(async () => {
    console.log("Đã kết nối với MongoDB");

    try {
      console.log("Bắt đầu seed dữ liệu...");

      await seedCategories();
      await seedColors();
      await seedStorages();
      await seedProducts();
      await seedUsers();
      await seedOrders();
      await seedOrderDetails();
      await seedDiscounts();

      console.log("Đã hoàn thành seed dữ liệu!");
      process.exit(0);
    } catch (error) {
      console.error("Lỗi khi seed dữ liệu:", error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Không thể kết nối với MongoDB:", err.message);
    process.exit(1);
  });
