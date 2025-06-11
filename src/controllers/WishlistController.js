import Wishlist from "../models/Wishlist.js";
import WishlistItem from "../models/WishlistItem.js";
import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const addToWishlist = handleAsync(async (req, res, next) => {
  const { product_id, note } = req.body;
  const user_id = req.user.id;

  if (!product_id) {
    return next(createError(400, "ID sản phẩm là bắt buộc"));
  }

  const product = await Product.findOne({
    _id: product_id,
    is_deleted: false,
    status: "active",
  });

  if (!product) {
    return next(
      createError(404, "Không tìm thấy sản phẩm hoặc sản phẩm không khả dụng")
    );
  }

  let wishlist = await Wishlist.findOne({ user_id });

  if (!wishlist) {
    wishlist = new Wishlist({ user_id });
    await wishlist.save();
  }

  const existingWishlistItem = await WishlistItem.findOne({
    wishlist_id: wishlist._id,
    product_id,
  });

  if (existingWishlistItem) {
    return next(createError(400, "Sản phẩm đã có trong danh sách yêu thích"));
  }

  const wishlistItem = new WishlistItem({
    wishlist_id: wishlist._id,
    product_id,
    note,
  });

  await wishlistItem.save();

  const populatedItem = await WishlistItem.findById(wishlistItem._id).populate({
    path: "product_id",
    select:
      "product_name price image_url description status stock_quantity category_id color_id storage_id",
    populate: [
      { path: "category_id", select: "category_name" },
      { path: "color_id", select: "color_name color_code" },
      { path: "storage_id", select: "storage_size" },
    ],
  });

  res.status(201).json({
    success: true,
    data: populatedItem,
    message:
      message.WISHLIST?.ADD_SUCCESS ||
      "Thêm sản phẩm vào danh sách yêu thích thành công",
  });
});

const getWishlistItems = handleAsync(async (req, res, next) => {
  const user_id = req.user.id;
  const { limit = 10, page = 1 } = req.query;

  const wishlist = await Wishlist.findOne({ user_id });

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: {
        items: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0,
        },
      },
      message: "Danh sách yêu thích trống",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const items = await WishlistItem.find({ wishlist_id: wishlist._id })
    .sort({ added_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: "product_id",
      select:
        "product_name price image_url description status stock_quantity category_id color_id storage_id",
      match: { is_deleted: false },
      populate: [
        { path: "category_id", select: "category_name" },
        { path: "color_id", select: "color_name color_code" },
        { path: "storage_id", select: "storage_size" },
      ],
    });

  const validItems = items.filter((item) => item.product_id !== null);

  const total = await WishlistItem.countDocuments({
    wishlist_id: wishlist._id,
    product_id: { $ne: null },
  });

  res.status(200).json({
    success: true,
    data: {
      items: validItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
    message:
      message.WISHLIST?.GET_ALL_SUCCESS || "Lấy danh sách yêu thích thành công",
  });
});

export { addToWishlist, getWishlistItems };
