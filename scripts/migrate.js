import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from '../src/models/Banner.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';    
import ProductColor from '../src/models/ProductColor.js';
import ProductStorage from '../src/models/ProductStorage.js';
import Discount from '../src/models/Discount.js';
import Wishlist from '../src/models/Wishlist.js';
import WishlistItem from '../src/models/WishlistItem.js';
import Cart from '../src/models/Cart.js';
import CartItem from '../src/models/CartItem.js';
import Coupon from '../src/models/Coupon.js';
import Order from '../src/models/Order.js';
import OrderDetail from '../src/models/OrderDetail.js';
import Review from '../src/models/Review.js';
import Payment from '../src/models/Payment.js';
import Shipping from '../src/models/Shipping.js';
import OrderStatusHistory from '../src/models/OrderStatusHistory.js';
import Inventory from '../src/models/Inventory.js';
import RefreshToken from '../src/models/RefreshToken.js';
import PasswordResetToken from '../src/models/PasswordResetToken.js';

// Load environment variables
dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.DB_URI);  
    console.log('Connected to MongoDB');

    const collectionsToUpdate = [
        { model: Banner, name: 'banners' },
        { model: Product, name: 'products' },
        { model: ProductColor, name: 'product_colors' },
        { model: ProductStorage, name: 'product_storages' },
        { model: Category, name: 'categories' },
        { model: Discount, name: 'discounts' },
        { model: Coupon, name: 'coupons' }
    ];

    for (const { model, name } of collectionsToUpdate) {
      const result = await model.updateMany(
        { is_deleted: { $exists: false } },
        { $set: { is_deleted: false } }
      );
      console.log(`Updated ${result.modifiedCount} documents in ${name} with is_deleted field`);
    }

    // Create indexes for frequently queried fields
    await Banner.collection.createIndex({ is_deleted: 1 });
    await User.collection.createIndex({ email: 1, role_id: 1 });
    await Category.collection.createIndex({ is_deleted: 1, category_name: 1 });
    await Product.collection.createIndex({ is_deleted: 1, category_id: 1, color_id: 1, storage_id: 1 });
    await ProductColor.collection.createIndex({ is_deleted: 1, color_name: 1 });
    await ProductStorage.collection.createIndex({ is_deleted: 1, storage_name: 1 });
    await Discount.collection.createIndex({ is_deleted: 1, product_id: 1 });
    await Wishlist.collection.createIndex({ user_id: 1 });
    await WishlistItem.collection.createIndex({ wishlist_id: 1, product_id: 1 });
    await Cart.collection.createIndex({ user_id: 1 });
    await CartItem.collection.createIndex({ cart_id: 1, product_id: 1 });
    await Coupon.collection.createIndex({ is_deleted: 1, code: 1 });
    await Order.collection.createIndex({ user_id: 1, coupon_id: 1 });
    await OrderDetail.collection.createIndex({ order_id: 1, product_id: 1 });
    await Review.collection.createIndex({ user_id: 1, product_id: 1 });
    await Payment.collection.createIndex({ order_id: 1 });
    await Shipping.collection.createIndex({ order_id: 1 });
    await OrderStatusHistory.collection.createIndex({ order_id: 1, changed_by: 1 });
    await Inventory.collection.createIndex({ product_id: 1 });
    await RefreshToken.collection.createIndex({ user_id: 1, expires_at: 1 });
    await PasswordResetToken.collection.createIndex({ user_id: 1, expires_at: 1 });

    console.log('Migration completed: All collections updated and indexes created');

    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();