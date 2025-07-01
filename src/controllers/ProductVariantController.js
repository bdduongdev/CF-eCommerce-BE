import ProductVariant from "../models/ProductVariant.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";

const createProductVariant = handleAsync(async (req, res, next) => {
  const { product_id, color_id, storage_id, price, stock_quantity, sku, status } = req.body;
  let image_url = req.body.image_url;
  let image_gallery = req.body.image_gallery;
  if (req.file) {
    image_url = `/uploads/products/${req.file.filename}`;
  }
  if (req.files && req.files.length > 0) {
    image_gallery = req.files.map(file => `/uploads/products/${file.filename}`);
  }
  if (!product_id || !color_id || !storage_id || !price || !stock_quantity) {
    return next(createError(400, "Thiếu thông tin biến thể sản phẩm."));
  }
  const newVariant = new ProductVariant({
    product_id,
    color_id,
    storage_id,
    price,
    stock_quantity,
    sku: sku || `${product_id}-${storage_id}-${color_id}`,
    image_url,
    image_gallery,
    status: status || 'active',
  });
  const savedVariant = await newVariant.save();
  res.status(201).json({
    success: true,
    message: "Tạo biến thể sản phẩm thành công.",
    data: savedVariant,
  });
});

const updateProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, "ID biến thể không hợp lệ."));
  }
  const updateData = { ...req.body };
  if (req.file) {
    updateData.image_url = `/uploads/products/${req.file.filename}`;
  }
  if (req.files && req.files.length > 0) {
    updateData.image_gallery = req.files.map(file => `/uploads/products/${file.filename}`);
  }
  const updatedVariant = await ProductVariant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!updatedVariant) {
    return next(createError(404, "Không tìm thấy biến thể sản phẩm."));
  }
  res.status(200).json({
    success: true,
    message: "Cập nhật biến thể sản phẩm thành công.",
    data: updatedVariant,
  });
});

const deleteProductVariant = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, "ID biến thể không hợp lệ."));
  }
  const deleted = await ProductVariant.findByIdAndUpdate(id, { is_deleted: true, updated_at: Date.now() }, { new: true });
  if (!deleted) {
    return next(createError(404, "Không tìm thấy biến thể sản phẩm."));
  }
  res.status(200).json({
    success: true,
    message: "Xóa biến thể sản phẩm thành công.",
  });
});

const getAllProductVariants = handleAsync(async (req, res, next) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sort,
    limit = 10,
    page = 1,
    status,
    color,
    storage,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const pipeline = [];

  // Match ProductVariant fields
  const matchStage = { is_deleted: false };

  if (status) matchStage.status = status;

  // Price range
  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
    if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
  }

  // Multiple color filter
  if (color) {
    const colorArray = String(color).split(',').map((id) => new mongoose.Types.ObjectId(id));
    matchStage.color_id = { $in: colorArray };
  }

  // Multiple storage filter
  if (storage) {
    const storageArray = String(storage).split(',').map((id) => new mongoose.Types.ObjectId(id));
    matchStage.storage_id = { $in: storageArray };
  }

  pipeline.push({ $match: matchStage });

  // Join with product
  pipeline.push({
    $lookup: {
      from: 'products',
      localField: 'product_id',
      foreignField: '_id',
      as: 'product',
    },
  });
  pipeline.push({ $unwind: '$product' });

  // Match product fields
  const productMatchStage = { 'product.is_deleted': false };

  if (category) {
    productMatchStage['product.category_id'] = new mongoose.Types.ObjectId(category);
  }

  if (search) {
    productMatchStage.$or = [
      { 'product.product_name': { $regex: search, $options: 'i' } },
      { 'product.slug': { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  pipeline.push({ $match: productMatchStage });

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const totalResult = await ProductVariant.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  // Sort
  let sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOptions[field === 'product_name' ? 'product.product_name' : field] =
      order === 'desc' ? -1 : 1;
  } else {
    sortOptions = { 'product.created_at': -1, price: 1 };
  }
  pipeline.push({ $sort: sortOptions });

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Lookup details
  pipeline.push(
    { $lookup: { from: 'productcolors', localField: 'color_id', foreignField: '_id', as: 'color' } },
    { $unwind: { path: '$color', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'productstorages', localField: 'storage_id', foreignField: '_id', as: 'storage' } },
    { $unwind: { path: '$storage', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'categories', localField: 'product.category_id', foreignField: '_id', as: 'product.category' } },
    { $unwind: { path: '$product.category', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'discountproducts',
        localField: 'product_id',
        foreignField: 'product_id',
        as: 'product_discounts_link',
      },
    },
    {
      $lookup: {
        from: 'discounts',
        let: { discount_ids: '$product_discounts_link.discount_id' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$discount_ids'] },
              is_active: true,
              start_date: { $lte: new Date() },
              end_date: { $gte: new Date() },
            },
          },
          {
            $project: {
              discount_type: 1,
              discount_value: 1,
              description: 1,
              end_date: 1,
            },
          },
        ],
        as: 'discounts',
      },
    }
  );

  // Final projection
  pipeline.push({
    $project: {
      _id: 1,
      price: 1,
      stock_quantity: 1,
      image_url: 1,
      image_gallery: 1,
      sku: 1,
      status: 1,
      product: {
        _id: '$product._id',
        product_name: '$product.product_name',
        slug: '$product.slug',
        description: '$product.description',
        category: '$product.category',
      },
      color: 1,
      storage: 1,
      discounts: 1,
    },
  });

  const products = await ProductVariant.aggregate(pipeline);

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách biến thể sản phẩm thành công!',
    data: {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getProductVariantById = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, "ID biến thể không hợp lệ."));
  }
  const variant = await ProductVariant.findById(id)
    .populate('product_id')
    .populate('color_id')
    .populate('storage_id');
  if (!variant) {
    return next(createError(404, "Không tìm thấy biến thể sản phẩm."));
  }
  res.status(200).json({
    success: true,
    message: "Lấy chi tiết biến thể thành công.",
    data: variant,
  });
});

export {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getAllProductVariants,
  getProductVariantById
}; 