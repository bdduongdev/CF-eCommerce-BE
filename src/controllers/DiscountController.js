import Discount from "../models/Discount.js";
import DiscountProduct from "../models/DiscountProduct.js";
import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import message from "../constants/index.js";
import mongoose from "mongoose";

// Helper function to determine discount status
const getDiscountStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'expired';
};

// Get all discounts with filtering and pagination
const getAllDiscounts = handleAsync(async (req, res, next) => {
  const {
    product_id,
    discount_type,
    status,
    limit = 10,
    page = 1
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = {};

  // Filter by discount_type
  if (discount_type) {
    query.discount_type = discount_type;
  }

  // Filter by is_active
  if (status === 'inactive') {
    query.is_active = false;
  } else {
    query.is_active = true;
  }

  // Filter by status (active, expired, upcoming)
  if (status && status !== 'inactive') {
    const now = new Date();
    switch (status) {
      case 'active':
        query.start_date = { $lte: now };
        query.end_date = { $gte: now };
        break;
      case 'expired':
        query.end_date = { $lt: now };
        break;
      case 'upcoming':
        query.start_date = { $gt: now };
        break;
    }
  }

  // If filtering by product_id, we need to join with DiscountProduct
  let aggregationPipeline = [];
  
  if (product_id) {
    // Stage 1: Match discount products for the specific product
    aggregationPipeline.push({
      $lookup: {
        from: 'discountproducts',
        localField: '_id',
        foreignField: 'discount_id',
        as: 'discount_products'
      }
    });
    
    aggregationPipeline.push({
      $match: {
        'discount_products.product_id': new mongoose.Types.ObjectId(product_id)
      }
    });
  }

  // Stage 2: Add the main discount query
  aggregationPipeline.push({
    $match: query
  });

  // Stage 3: Lookup products for each discount
  aggregationPipeline.push({
    $lookup: {
      from: 'discountproducts',
      localField: '_id',
      foreignField: 'discount_id',
      as: 'discount_products'
    }
  });

  aggregationPipeline.push({
    $lookup: {
      from: 'products',
      localField: 'discount_products.product_id',
      foreignField: '_id',
      as: 'products'
    }
  });

  // Stage 4: Project the final result
  aggregationPipeline.push({
    $project: {
      _id: 1,
      discount_type: 1,
      discount_value: 1,
      start_date: 1,
      end_date: 1,
      description: 1,
      is_active: 1,
      created_at: 1,
      updated_at: 1,
      products: {
        _id: 1,
        product_name: 1,
        price: 1,
        image_url: 1
      }
    }
  });

  // Stage 5: Sort and paginate
  aggregationPipeline.push(
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: parseInt(limit) }
  );

  const discounts = await Discount.aggregate(aggregationPipeline);

  // Add status to each discount
  const discountsWithStatus = discounts.map(discount => {
    const discountObj = { ...discount };
    discountObj.status = getDiscountStatus(discount.start_date, discount.end_date);
    return discountObj;
  });

  // Count total for pagination
  const countPipeline = aggregationPipeline.slice(0, -3); // Remove sort, skip, limit
  countPipeline.push({ $count: "total" });
  const totalResult = await Discount.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  res.status(200).json({
    success: true,
    message: message.DISCOUNT.GET_ALL_SUCCESS,
    data: {
      discounts: discountsWithStatus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// Get discount by ID
const getDiscountById = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.DISCOUNT.INVALID_ID));
  }

  const discount = await Discount.findById(id);
  if (!discount) {
    return next(createError(404, message.DISCOUNT.NOT_FOUND));
  }

  // Get associated products
  const discountProducts = await DiscountProduct.find({ discount_id: id })
    .populate('product_id', 'product_name price image_url');

  const discountObj = discount.toObject();
  discountObj.status = getDiscountStatus(discount.start_date, discount.end_date);
  discountObj.products = discountProducts.map(dp => dp.product_id);

  res.status(200).json({
    success: true,
    message: message.DISCOUNT.GET_BY_ID_SUCCESS,
    data: discountObj,
  });
});

// Create new discount
const createDiscount = handleAsync(async (req, res, next) => {
  const { product_ids, discount_type, discount_value, start_date, end_date, description, is_active } = req.body;

  // Validate discount value based on type
  if (discount_type === 'percentage' && discount_value > 100) {
    return next(createError(400, 'Phần trăm giảm giá không được vượt quá 100%'));
  }

  // Check if products exist
  if (product_ids && product_ids.length > 0) {
    const products = await Product.find({ _id: { $in: product_ids } });
    if (products.length !== product_ids.length) {
      return next(createError(404, 'Một số sản phẩm không tồn tại'));
    }
  }

  const discount = new Discount({
    discount_type,
    discount_value,
    start_date,
    end_date,
    description,
    is_active: is_active !== undefined ? is_active : true
  });

  await discount.save();

  // Create discount-product relationships
  if (product_ids && product_ids.length > 0) {
    const discountProducts = product_ids.map(product_id => ({
      discount_id: discount._id,
      product_id: product_id
    }));

    await DiscountProduct.insertMany(discountProducts);
  }

  // Get the created discount with products
  const populatedDiscount = await Discount.findById(discount._id);
  const discountProducts = await DiscountProduct.find({ discount_id: discount._id })
    .populate('product_id', 'product_name price image_url');

  const discountObj = populatedDiscount.toObject();
  discountObj.status = getDiscountStatus(discount.start_date, discount.end_date);
  discountObj.products = discountProducts.map(dp => dp.product_id);

  res.status(201).json({
    success: true,
    message: message.DISCOUNT.CREATE_SUCCESS,
    data: discountObj,
  });
});

// Update discount
const updateDiscount = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.DISCOUNT.INVALID_ID));
  }

  // Validate discount value based on type
  if (updateData.discount_type === 'percentage' && updateData.discount_value > 100) {
    return next(createError(400, 'Phần trăm giảm giá không được vượt quá 100%'));
  }

  // Check if products exist if updating product_ids
  if (updateData.product_ids && updateData.product_ids.length > 0) {
    const products = await Product.find({ _id: { $in: updateData.product_ids } });
    if (products.length !== updateData.product_ids.length) {
      return next(createError(404, 'Một số sản phẩm không tồn tại'));
    }
  }

  const discount = await Discount.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!discount) {
    return next(createError(404, message.DISCOUNT.NOT_FOUND));
  }

  // Update product associations if product_ids is provided
  if (updateData.product_ids !== undefined) {
    // Remove existing associations
    await DiscountProduct.deleteMany({ discount_id: id });

    // Create new associations
    if (updateData.product_ids.length > 0) {
      const discountProducts = updateData.product_ids.map(product_id => ({
        discount_id: id,
        product_id: product_id
      }));

      await DiscountProduct.insertMany(discountProducts);
    }
  }

  // Get updated discount with products
  const discountProducts = await DiscountProduct.find({ discount_id: id })
    .populate('product_id', 'product_name price image_url');

  const discountObj = discount.toObject();
  discountObj.status = getDiscountStatus(discount.start_date, discount.end_date);
  discountObj.products = discountProducts.map(dp => dp.product_id);

  res.status(200).json({
    success: true,
    message: message.DISCOUNT.UPDATE_SUCCESS,
    data: discountObj,
  });
});

// Delete discount
const deleteDiscount = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.DISCOUNT.INVALID_ID));
  }

  const discount = await Discount.findByIdAndDelete(id);

  if (!discount) {
    return next(createError(404, message.DISCOUNT.NOT_FOUND));
  }

  // Delete associated discount-product relationships
  await DiscountProduct.deleteMany({ discount_id: id });

  res.status(200).json({
    success: true,
    message: message.DISCOUNT.DELETE_SUCCESS,
  });
});

// Get active discounts for a product
const getActiveDiscountsForProduct = handleAsync(async (req, res, next) => {
  const { product_id } = req.params;
  const now = new Date();

  if (!mongoose.Types.ObjectId.isValid(product_id)) {
    return next(createError(400, 'ID sản phẩm không hợp lệ'));
  }

  const discountProducts = await DiscountProduct.find({
    product_id: new mongoose.Types.ObjectId(product_id)
  }).populate({
    path: 'discount_id',
    match: {
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    }
  });

  const activeDiscounts = discountProducts
    .filter(dp => dp.discount_id) // Filter out null discounts (due to match)
    .map(dp => dp.discount_id)
    .sort((a, b) => b.discount_value - a.discount_value);

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách giảm giá đang hoạt động thành công',
    data: activeDiscounts,
  });
});

// Get all active discounts
const getActiveDiscounts = handleAsync(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;
  const now = new Date();
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const aggregationPipeline = [
    {
      $match: {
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      }
    },
    {
      $lookup: {
        from: 'discountproducts',
        localField: '_id',
        foreignField: 'discount_id',
        as: 'discount_products'
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'discount_products.product_id',
        foreignField: '_id',
        as: 'products'
      }
    },
    {
      $project: {
        _id: 1,
        discount_type: 1,
        discount_value: 1,
        start_date: 1,
        end_date: 1,
        description: 1,
        is_active: 1,
        created_at: 1,
        updated_at: 1,
        products: {
          _id: 1,
          product_name: 1,
          price: 1,
          image_url: 1
        }
      }
    },
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: parseInt(limit) }
  ];

  const discounts = await Discount.aggregate(aggregationPipeline);

  const discountsWithStatus = discounts.map(discount => {
    const discountObj = { ...discount };
    discountObj.status = 'active';
    return discountObj;
  });

  // Count total
  const countPipeline = aggregationPipeline.slice(0, -3);
  countPipeline.push({ $count: "total" });
  const totalResult = await Discount.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách giảm giá đang hoạt động thành công',
    data: {
      discounts: discountsWithStatus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// Add products to discount
const addProductsToDiscount = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { product_ids } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.DISCOUNT.INVALID_ID));
  }

  const discount = await Discount.findById(id);
  if (!discount) {
    return next(createError(404, message.DISCOUNT.NOT_FOUND));
  }

  // Check if products exist
  const products = await Product.find({ _id: { $in: product_ids } });
  if (products.length !== product_ids.length) {
    return next(createError(404, 'Một số sản phẩm không tồn tại'));
  }

  // Create discount-product relationships (ignore duplicates)
  const discountProducts = product_ids.map(product_id => ({
    discount_id: id,
    product_id: product_id
  }));

  try {
    await DiscountProduct.insertMany(discountProducts, { ordered: false });
  } catch (error) {
    // Ignore duplicate key errors
    if (error.code !== 11000) {
      throw error;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Thêm sản phẩm vào giảm giá thành công',
  });
});

// Remove products from discount
const removeProductsFromDiscount = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { product_ids } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.DISCOUNT.INVALID_ID));
  }

  const discount = await Discount.findById(id);
  if (!discount) {
    return next(createError(404, message.DISCOUNT.NOT_FOUND));
  }

  // Remove discount-product relationships
  await DiscountProduct.deleteMany({
    discount_id: id,
    product_id: { $in: product_ids }
  });

  res.status(200).json({
    success: true,
    message: 'Xóa sản phẩm khỏi giảm giá thành công',
  });
});

export {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getActiveDiscountsForProduct,
  getActiveDiscounts,
  addProductsToDiscount,
  removeProductsFromDiscount
};
