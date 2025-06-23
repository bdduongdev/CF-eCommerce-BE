import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Category from "../models/Category.js";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";

const seedProducts = async () => {
  try {
    // 1. Xóa tất cả dữ liệu cũ để tránh trùng lặp
    await ProductVariant.deleteMany();
    await Product.deleteMany();
    console.log("Đã xóa dữ liệu Product và ProductVariant cũ");

    // 2. Lấy dữ liệu cần thiết từ các collection khác
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

    // 3. Định nghĩa các model sản phẩm gốc
    const iPhoneModels = [
      { name: "iPhone 13", basePrice: 15990000 },
      { name: "iPhone 13 Mini", basePrice: 13990000 },
      { name: "iPhone 13 Pro", basePrice: 21990000 },
      { name: "iPhone 13 Pro Max", basePrice: 23990000 },
      { name: "iPhone 14", basePrice: 19990000 },
      { name: "iPhone 14 Plus", basePrice: 21990000 },
      { name: "iPhone 14 Pro", basePrice: 25990000 },
      { name: "iPhone 14 Pro Max", basePrice: 28990000 },
      { name: "iPhone 15", basePrice: 22990000 },
      { name: "iPhone 15 Plus", basePrice: 24990000 },
      { name: "iPhone 15 Pro", basePrice: 28990000 },
      { name: "iPhone 15 Pro Max", basePrice: 33990000 }
    ];

    const baseProducts = [];
    for (const model of iPhoneModels) {
      const slug = model.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      baseProducts.push({
        product_name: model.name,
        slug: slug,
        description: `Điện thoại ${model.name} chính hãng, hiệu năng mạnh mẽ, thiết kế sang trọng.`,
        category_id: iphoneCategory._id,
        status: 'active'
      });
    }

    // 4. Thêm các sản phẩm gốc vào DB
    const createdProducts = await Product.insertMany(baseProducts);
    console.log(`Đã thêm ${createdProducts.length} sản phẩm gốc.`);

    const productVariants = [];
    const modelPriceMap = new Map(iPhoneModels.map(m => [m.name, m.basePrice]));

    // 5. Tạo các biến thể cho từng sản phẩm gốc
    for (const baseProduct of createdProducts) {
      const basePrice = modelPriceMap.get(baseProduct.product_name) || 0;

      for (const color of colors) {
        for (const storage of storages) {
          const stockQuantity = Math.floor(Math.random() * 50) + 5;
          const status = stockQuantity > 0 ? 'active' : 'out_of_stock';
          
          const colorPrice = typeof color.price === 'number' ? color.price : 0;
          const storagePrice = typeof storage.price === 'number' ? storage.price : 0;
          const totalPrice = basePrice + colorPrice + storagePrice;

          const sku = `${baseProduct.slug}-${storage.storage_name.toLowerCase()}-${color.color_name.toLowerCase()}`.replace(/\s+/g, '');

          productVariants.push({
            product_id: baseProduct._id,
            color_id: color._id,
            storage_id: storage._id,
            price: totalPrice,
            stock_quantity: stockQuantity,
            status: status,
            sku: sku
          });
        }
      }
    }

    // 6. Thêm tất cả các biến thể vào DB
    if (productVariants.length > 0) {
      await ProductVariant.insertMany(productVariants);
      console.log(`Đã thêm ${productVariants.length} biến thể sản phẩm.`);
    } else {
      console.log("Không có biến thể sản phẩm nào được tạo");
    }
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed Product: ${error.message}`);
    return false;
  }
};

export default seedProducts;