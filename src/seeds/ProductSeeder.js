import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";
import mongoose from "mongoose";

const seedProducts = async () => {
  try {
    await Product.deleteMany();
    console.log("Đã xóa dữ liệu Product cũ");

    const categories = await Category.find();
    const colors = await ProductColor.find();
    const storages = await ProductStorage.find();

    if (categories.length === 0 || colors.length === 0 || storages.length === 0) {
      console.log("Không đủ dữ liệu categories, colors hoặc storages để tạo sản phẩm");
      return false;
    }

    let iphoneCategory = categories.find(c => c.category_name.toLowerCase().includes('iphone'));
    if (!iphoneCategory) {
      iphoneCategory = categories[0];
    }

    const iPhoneModels = [
      {
        name: "iPhone 13",
        slug: "iphone-13",
        basePrice: 15990000,
        description: "iPhone 13 với màn hình Super Retina XDR 6.1 inch, chip A15 Bionic mạnh mẽ và hệ thống camera kép tiên tiến."
      },
      {
        name: "iPhone 13 Mini",
        slug: "iphone-13-mini",
        basePrice: 13990000,
        description: "iPhone 13 Mini với màn hình Super Retina XDR 5.4 inch, chip A15 Bionic và thiết kế nhỏ gọn."
      },
      {
        name: "iPhone 13 Pro",
        slug: "iphone-13-pro",
        basePrice: 21990000,
        description: "iPhone 13 Pro với màn hình ProMotion 120Hz, chip A15 Bionic, hệ thống camera Pro và thời lượng pin dài hơn."
      },
      {
        name: "iPhone 13 Pro Max",
        slug: "iphone-13-pro-max",
        basePrice: 23990000,
        description: "iPhone 13 Pro Max với màn hình ProMotion 6.7 inch, chip A15 Bionic, hệ thống camera Pro và thời lượng pin cực dài."
      },
      {
        name: "iPhone 14",
        slug: "iphone-14",
        basePrice: 19990000,
        description: "iPhone 14 với màn hình Super Retina XDR 6.1 inch, chip A15 Bionic, camera nâng cấp và các tính năng an toàn mới."
      },
      {
        name: "iPhone 14 Plus",
        slug: "iphone-14-plus",
        basePrice: 21990000,
        description: "iPhone 14 Plus với màn hình Super Retina XDR 6.7 inch, chip A15 Bionic, camera nâng cấp và pin dài hơn."
      },
      {
        name: "iPhone 14 Pro",
        slug: "iphone-14-pro",
        basePrice: 25990000,
        description: "iPhone 14 Pro với Dynamic Island, màn hình Always-On, camera 48MP và chip A16 Bionic mạnh mẽ nhất."
      },
      {
        name: "iPhone 14 Pro Max",
        slug: "iphone-14-pro-max",
        basePrice: 28990000,
        description: "iPhone 14 Pro Max với Dynamic Island, màn hình Always-On 6.7 inch, camera 48MP và pin dài nhất."
      },
      {
        name: "iPhone 15",
        slug: "iphone-15",
        basePrice: 22990000,
        description: "iPhone 15 với thiết kế Dynamic Island, cổng USB-C, camera 48MP và chip A16 Bionic mạnh mẽ."
      },
      {
        name: "iPhone 15 Plus",
        slug: "iphone-15-plus",
        basePrice: 24990000,
        description: "iPhone 15 Plus với màn hình 6.7 inch, cổng USB-C, camera 48MP và thời lượng pin cực dài."
      },
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        basePrice: 28990000,
        description: "iPhone 15 Pro với khung titan, chip A17 Pro, cổng USB-C tốc độ cao và hệ thống camera chuyên nghiệp."
      },
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        basePrice: 33990000,
        description: "iPhone 15 Pro Max với khung titan, màn hình 6.7 inch, camera tele 5x và hiệu suất chơi game đỉnh cao."
      }
    ];

    // URL ảnh mặc định cho tất cả sản phẩm
    const defaultImageUrl = "/uploads/products/default-product.jpg";

    const products = [];
    const now = new Date();

    // Create base products with their slugs
    for (const model of iPhoneModels) {
      // Generate a random stock quantity between 5 and 55
      const stockQuantity = Math.floor(Math.random() * 50) + 5;
      
      // Determine product status based on stock
      let status = 'active';
      if (stockQuantity === 0) {
        status = 'out_of_stock';
      } else if (Math.random() < 0.1) {
        status = 'inactive';
      }
      
      products.push({
        product_name: model.name,
        slug: model.slug,
        description: model.description,
        price: model.basePrice,
        stock_quantity: stockQuantity,
        status: status,
        category_id: iphoneCategory._id,
        image_url: defaultImageUrl,
        created_at: now,
        updated_at: now
      });
    }

    await Product.insertMany(products);
    console.log(`Đã thêm ${products.length} sản phẩm iPhone mẫu`);
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Product: ${error.message}`);
    return false;
  }
};

export default seedProducts;