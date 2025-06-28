import Discount from "../models/Discount.js";
import DiscountProduct from "../models/DiscountProduct.js";
import Product from "../models/Product.js";

const discountData = [
  {
    discount_type: "percentage",
    discount_value: 15,
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-12-31"),
    description: "Giảm giá 15% cho tất cả sản phẩm iPhone",
    is_active: true
  },
  {
    discount_type: "fixed",
    discount_value: 500000,
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-06-30"),
    description: "Giảm giá cố định 500,000 VNĐ cho iPhone 15 Pro",
    is_active: true
  },
  {
    discount_type: "percentage",
    discount_value: 20,
    start_date: new Date("2024-02-01"),
    end_date: new Date("2024-05-31"),
    description: "Giảm giá 20% cho iPhone 14 series",
    is_active: true
  },
  {
    discount_type: "fixed",
    discount_value: 300000,
    start_date: new Date("2024-03-01"),
    end_date: new Date("2024-08-31"),
    description: "Giảm giá cố định 300,000 VNĐ cho iPhone 13 series",
    is_active: true
  },
  {
    discount_type: "percentage",
    discount_value: 10,
    start_date: new Date("2024-06-01"),
    end_date: new Date("2024-12-31"),
    description: "Giảm giá 10% cho tất cả sản phẩm",
    is_active: true
  }
];

const seedDiscounts = async () => {
  try {
    // Clear existing discounts and discount products
    await Discount.deleteMany({});
    await DiscountProduct.deleteMany({});
    console.log("Cleared existing discounts and discount products");

    // Get some products to assign discounts to
    const products = await Product.find({}).limit(10);
    
    if (products.length === 0) {
      console.log("No products found. Please seed products first.");
      return;
    }

    // Create discounts
    const createdDiscounts = await Discount.insertMany(discountData);
    console.log(`Created ${createdDiscounts.length} discounts`);

    // Create discount-product relationships
    const discountProducts = [];
    
    createdDiscounts.forEach((discount, index) => {
      // Assign 2-3 products to each discount
      const numProducts = Math.min(2 + (index % 2), products.length);
      const selectedProducts = products.slice(0, numProducts);
      
      selectedProducts.forEach(product => {
        discountProducts.push({
          discount_id: discount._id,
          product_id: product._id
        });
      });
    });

    if (discountProducts.length > 0) {
      await DiscountProduct.insertMany(discountProducts);
      console.log(`Created ${discountProducts.length} discount-product relationships`);
    }

    console.log("Discount seeding completed successfully");
    return createdDiscounts;
  } catch (error) {
    console.error("Error seeding discounts:", error);
    throw error;
  }
};

const clearDiscounts = async () => {
  try {
    await Discount.deleteMany({});
    await DiscountProduct.deleteMany({});
    console.log("Cleared all discounts and discount products");
  } catch (error) {
    console.error("Error clearing discounts:", error);
    throw error;
  }
};

export { seedDiscounts, clearDiscounts };