import mongoose from 'mongoose';
import OrderDetail from "../models/OrderDetail.js";
import Order from "../models/Order.js";
import ProductVariant from "../models/ProductVariant.js";
import Product from "../models/Product.js";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";
import { faker } from '@faker-js/faker';

const seedOrderDetails = async () => {
  try {
    // Đảm bảo kết nối database
    if (mongoose.connection.readyState !== 1) {
      console.log('Đang kết nối database...');
      await mongoose.connect(process.env.DB_URI);
    }

    await OrderDetail.deleteMany();
    console.log("Đã xóa dữ liệu OrderDetail cũ");

    // Lấy tất cả đơn hàng
    const orders = await Order.find();
    if (orders.length === 0) {
      console.log("Không có đơn hàng nào để tạo chi tiết");
      return false;
    }

    // Lấy tất cả product variants
    const productVariants = await ProductVariant.find({ is_deleted: false });
    if (productVariants.length === 0) {
      console.log("Không có product variant nào để tạo chi tiết đơn hàng");
      return false;
    }

    // Populate thông tin sản phẩm, màu sắc, dung lượng
    const variantsWithInfo = await ProductVariant.aggregate([
      { $match: { is_deleted: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $lookup: {
          from: 'productcolors',
          localField: 'color_id',
          foreignField: '_id',
          as: 'color'
        }
      },
      {
        $lookup: {
          from: 'productstorages',
          localField: 'storage_id',
          foreignField: '_id',
          as: 'storage'
        }
      },
      {
        $project: {
          _id: 1,
          price: 1,
          stock_quantity: 1,
          image_url: 1,
          sku: 1,
          product_name: { $arrayElemAt: ['$product.product_name', 0] },
          color_name: { $arrayElemAt: ['$color.color_name', 0] },
          storage_name: { $arrayElemAt: ['$storage.storage_name', 0] }
        }
      }
    ]);

    console.log(`Tìm thấy ${variantsWithInfo.length} product variants`);

    const orderDetails = [];
    const itemStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    for (const order of orders) {
      // Mỗi đơn hàng có 1-5 sản phẩm
      const numberOfItems = faker.number.int({ min: 1, max: 5 });
      const usedVariants = new Set(); // Để tránh trùng lặp variant trong cùng đơn hàng

      for (let i = 0; i < numberOfItems; i++) {
        // Chọn variant chưa được sử dụng trong đơn hàng này
        const availableVariants = variantsWithInfo.filter(v => !usedVariants.has(v._id.toString()));
        if (availableVariants.length === 0) break;

        const randomVariant = availableVariants[Math.floor(Math.random() * availableVariants.length)];
        usedVariants.add(randomVariant._id.toString());

        const quantity = faker.number.int({ min: 1, max: 3 });
        const unitPrice = randomVariant.price;
        const totalPrice = quantity * unitPrice;

        // Trạng thái item luôn là chữ thường
        let itemStatus = order.status.toLowerCase();
        if (itemStatus === 'cancelled') {
          itemStatus = 'cancelled';
        } else if (itemStatus === 'delivered') {
          itemStatus = 'delivered';
        } else if (itemStatus === 'shipped') {
          itemStatus = faker.helpers.arrayElement(['shipped', 'delivered']);
        } else if (itemStatus === 'processing') {
          itemStatus = faker.helpers.arrayElement(['confirmed', 'processing', 'shipped']);
        } else if (itemStatus === 'confirmed') {
          itemStatus = faker.helpers.arrayElement(['confirmed', 'processing']);
        }
        itemStatus = itemStatus.toLowerCase();

        const orderDetail = {
          order_id: order._id,
          product_variant_id: randomVariant._id,
          product_info: {
            product_name: randomVariant.product_name,
            color_name: randomVariant.color_name,
            storage_name: randomVariant.storage_name,
            sku: randomVariant.sku,
            image_url: randomVariant.image_url || null
          },
          quantity: quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          note: faker.helpers.arrayElement([
            null,
            "Giao hàng cẩn thận",
            "Kiểm tra kỹ trước khi giao",
            "Sản phẩm mới",
            "Đóng gói đẹp"
          ]),
          item_status: itemStatus
        };

        orderDetails.push(orderDetail);
      }
    }

    if (orderDetails.length > 0) {
      await OrderDetail.insertMany(orderDetails);
      console.log(`Đã thêm ${orderDetails.length} chi tiết đơn hàng mẫu`);
    } else {
      console.log("Không có chi tiết đơn hàng nào được tạo");
    }
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi seed OrderDetail: ${error.message}`);
    return false;
  }
};

export default seedOrderDetails; 