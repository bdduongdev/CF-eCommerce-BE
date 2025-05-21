import mongoose from "mongoose";
import { DB_URI } from "../configs/enviroments.js";
import seedCategories from "./categorySeeder.js";
import seedUsers from "./userSeeder.js";
import "../models/passwordReset.js";

// Kết nối đến database
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Kết nối database thành công để seed dữ liệu");
    
    // await mongoose.connection.db.dropDatabase();
    // console.log("Đã xóa database cũ");
    
    await seedCategories(10);
    await seedUsers(10);
    
    console.log("Seed dữ liệu thành công");
    process.exit(0);
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

connectDB();