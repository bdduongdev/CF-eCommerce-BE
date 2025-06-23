import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";
import fs from "fs";
import path from "path";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";

const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
};

const processProductImages = (req, product) => {
  if (!product) return product;
  
  const productObj = { ...product };
  
  if (productObj.image_url) {
    productObj.image_url = getFullImageUrl(req, productObj.image_url);
  }
  
  if (productObj.image_gallery && Array.isArray(productObj.image_gallery)) {
    productObj.image_gallery = productObj.image_gallery.map(img => getFullImageUrl(req, img));
  }
  
  return productObj;
};

const processProductsImages = (req, products) => {
  if (!products || !Array.isArray(products)) return products;
  
  return products.map(product => {
    const productObj = { ...product };
    
    if (productObj.image_url) {
      productObj.image_url = getFullImageUrl(req, productObj.image_url);
    }
    
    if (productObj.image_gallery && Array.isArray(productObj.image_gallery)) {
      productObj.image_gallery = productObj.image_gallery.map(img => getFullImageUrl(req, img));
    }
    
    return productObj;
  });
};

const getAllProducts = handleAsync(async (req, res, next) => {
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
    storage
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // --- Aggregation Pipeline based on ProductVariants ---
  const pipeline = [];

  // Stage 1: Initial match on ProductVariant fields
  const matchStage = { is_deleted: false };
  if (status) matchStage.status = status;
  if (minPrice) matchStage.price = { ...matchStage.price, $gte: parseFloat(minPrice) };
  if (maxPrice) matchStage.price = { ...matchStage.price, $lte: parseFloat(maxPrice) };
  if (color) matchStage.color_id = new mongoose.Types.ObjectId(color);
  if (storage) matchStage.storage_id = new mongoose.Types.ObjectId(storage);
  
  pipeline.push({ $match: matchStage });

  // Stage 2: Join with products collection
  pipeline.push({
    $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' }
  });
  pipeline.push({ $unwind: '$product' });

  // Stage 3: Match on parent product fields
  const productMatchStage = { 'product.is_deleted': false };
  if (category) {
    productMatchStage['product.category_id'] = new mongoose.Types.ObjectId(category);
  }
  if (search) {
    productMatchStage.$or = [
      { 'product.product_name': { $regex: search, $options: 'i' } },
      { 'product.slug': { $regex: search, $options: 'i' } },
      { 'sku': { $regex: search, $options: 'i' } }
    ];
  }
  pipeline.push({ $match: productMatchStage });
  
  // --- Execute pipeline for counting total documents ---
  const countPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await ProductVariant.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;
  
  // Stage 4: Sorting
  let sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(":");
    sortOptions[field === 'product_name' ? 'product.product_name' : field] = order === "desc" ? -1 : 1;
  } else {
    sortOptions = { 'product.created_at': -1, 'price': 1 };
  }
  pipeline.push({ $sort: sortOptions });

  // Stage 5: Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Stage 6: Join with other collections for details
  pipeline.push(
    { $lookup: { from: 'productcolors', localField: 'color_id', foreignField: '_id', as: 'color' } },
    { $unwind: '$color' },
    { $lookup: { from: 'productstorages', localField: 'storage_id', foreignField: '_id', as: 'storage' } },
    { $unwind: '$storage' },
    { $lookup: { from: 'categories', localField: 'product.category_id', foreignField: '_id', as: 'product.category' } },
    { $unwind: '$product.category' }
  );

  // Stage 7: Final Projection to shape the output
  pipeline.push({
    $project: {
      'product.category_id': 0, 'product.is_deleted': 0, 'product.status': 0,
      'color_id': 0, 'storage_id': 0, 'is_deleted': 0, '__v': 0, 'product.__v': 0,
      'color.__v': 0, 'storage.__v': 0, 'product.category.__v': 0,
    }
  });

  const products = await ProductVariant.aggregate(pipeline);
  const productsWithFullImageUrls = processProductsImages(req, products);

  res.status(200).json({
    success: true,
    message: message.PRODUCT.GET_ALL_SUCCESS,
    data: {
      products: productsWithFullImageUrls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getTrashedProducts = handleAsync(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;

  const query = { is_deleted: true };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(query)
    .sort({ updated_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("category_id", "category_name")
    .populate("color_id", "color_name price")
    .populate("storage_id", "storage_name price");

  const productsWithTotalPrice = products.map((product) => {
    const productObj = product.toObject();
    const basePrice = productObj.price || 0;
    const colorPrice = productObj.color_id?.price || 0;
    const storagePrice = productObj.storage_id?.price || 0;
    productObj.total_price = basePrice + colorPrice + storagePrice;
    return productObj;
  });

  const productsWithFullImageUrls = processProductsImages(req, productsWithTotalPrice);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      products: productsWithFullImageUrls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
    message: message.PRODUCT.GET_TRASHED_SUCCESS,
  });
});

const getProductById = handleAsync(async (req, res, next) => {
  // TODO: Refactor this function. It should probably fetch a ProductVariant by ID.
  const { id } = req.params;

  const variant = await ProductVariant.findById(id)
    .populate({
      path: 'product_id',
      populate: {
        path: 'category_id',
        select: 'category_name'
      }
    })
    .populate('color_id', 'color_name')
    .populate('storage_id', 'storage_name');

  if (!variant) {
    return next(createError(404, "Không tìm thấy biến thể sản phẩm"));
  }
  
  const variantObj = variant.toObject();
  const productWithFullImageUrls = processProductImages(req, variantObj);

  res.status(200).json({
    success: true,
    data: productWithFullImageUrls,
    message: "Lấy chi tiết biến thể sản phẩm thành công.",
  });
});

const getGroupedProductBySlug = handleAsync(async (req, res, next) => {
  const { slug } = req.params;

  // 1. Find the base product by slug
  const baseProduct = await Product.findOne({ slug: slug, is_deleted: false })
    .populate("category_id", "category_name");

  if (!baseProduct) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  // 2. Find all variants for this product
  const variants = await ProductVariant.find({ product_id: baseProduct._id, is_deleted: false })
    .populate("color_id", "color_name price")
    .populate("storage_id", "storage_name price");
    
  if (!variants || variants.length === 0) {
    return next(createError(404, "Sản phẩm này chưa có biến thể nào"));
  }
  
  // 3. Process variants and aggregate options
  const availableColors = [...new Map(variants.map(item => [item.color_id._id.toString(), item.color_id])).values()];
  const availableStorages = [...new Map(variants.map(item => [item.storage_id._id.toString(), item.storage_id])).values()];

  const formattedVariants = variants.map(v => {
    const variantObj = v.toObject();
    const processedVariant = processProductImages(req, variantObj);
    return {
      ...processedVariant,
      variant_id: processedVariant._id,
      color: processedVariant.color_id,
      storage: processedVariant.storage_id,
    };
  });
  
  // 4. Construct the response
  const responseData = {
    ...baseProduct.toObject(),
    options: {
      colors: availableColors.map(c => c.toObject()),
      storages: availableStorages.map(s => s.toObject()),
    },
    variants: formattedVariants,
  };

  res.status(200).json({
    success: true,
    message: message.PRODUCT.GET_BY_ID_SUCCESS,
    data: responseData,
  });
});

const createProduct = handleAsync(async (req, res, next) => {
  const {
    product_name,
    slug,
    description,
    category_id,
    status,
    variants // Expecting an array of variants
  } = req.body;

  // Basic validation
  if (!product_name || !category_id || !variants || !Array.isArray(variants) || variants.length === 0) {
    return next(createError(400, "Thông tin sản phẩm không hợp lệ. Yêu cầu product_name, category_id và mảng 'variants'."));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the base product
    let productSlug = slug;
    if (!productSlug && product_name) {
      productSlug = product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const newProduct = new Product({
      product_name,
      slug: productSlug,
      description,
      category_id,
      status: status || 'active'
    });

    const savedProduct = await newProduct.save({ session });

    // 2. Create product variants
    const variantDocs = variants.map(v => ({
      product_id: savedProduct._id,
      color_id: v.color_id,
      storage_id: v.storage_id,
      price: v.price,
      stock_quantity: v.stock_quantity,
      sku: `${productSlug}-${v.storage_id}-${v.color_id}`, // Note: this is a simplistic SKU
      // image_url and image_gallery would be handled separately, perhaps in an update step
    }));

    const createdVariants = await ProductVariant.insertMany(variantDocs, { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: message.PRODUCT.CREATE_SUCCESS,
      data: {
        product: savedProduct,
        variants: createdVariants
      }
    });

  } catch (error) {
    await session.abortTransaction();
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return next(createError(400, messages.join(", ")));
    }
    return next(error);
  } finally {
    session.endSession();
  }
});

const updateProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Base product ID
  const { product_name, slug, description, category_id, status, variants } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(404, message.PRODUCT.NOT_FOUND));
    }

    // 1. Update base product details
    product.product_name = product_name || product.product_name;
    product.description = description || product.description;
    product.category_id = category_id || product.category_id;
    product.status = status || product.status;

    if (product_name && !slug) {
      product.slug = product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    } else if (slug) {
      product.slug = slug;
    }

    const updatedProduct = await product.save({ session });

    // 2. Handle variants if provided
    if (variants && Array.isArray(variants)) {
      const existingVariants = await ProductVariant.find({ product_id: id }).session(session);
      const existingVariantIds = existingVariants.map(v => v._id.toString());
      const incomingVariantIds = variants.filter(v => v._id).map(v => v._id);

      const variantsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));
      if (variantsToDelete.length > 0) {
        await ProductVariant.updateMany(
          { _id: { $in: variantsToDelete } },
          { $set: { is_deleted: true, updated_at: Date.now() } },
          { session }
        );
      }
      
      for (const variantData of variants) {
        if (variantData._id && existingVariantIds.includes(variantData._id)) {
          await ProductVariant.findByIdAndUpdate(
            variantData._id, 
            { $set: variantData },
            { session, runValidators: true }
          );
        } else {
          const newVariant = new ProductVariant({
            ...variantData,
            product_id: id,
            sku: `${product.slug}-${variantData.storage_id}-${variantData.color_id}`
          });
          await newVariant.save({ session });
        }
      }
    }

    await session.commitTransaction();

    const finalProduct = await Product.findById(id).lean();
    const finalVariants = await ProductVariant.find({ product_id: id, is_deleted: false }).lean();

    res.status(200).json({
      success: true,
      message: message.PRODUCT.UPDATE_SUCCESS,
      data: {
        product: finalProduct,
        variants: finalVariants
      },
    });

  } catch (error) {
    await session.abortTransaction();
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return next(createError(400, messages.join(", ")));
    }
    return next(error);
  } finally {
    session.endSession();
  }
});

const deleteProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Base Product ID

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(404, message.PRODUCT.NOT_FOUND));
    }

    if (product.is_deleted) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, message.PRODUCT.ALREADY_DELETED));
    }

    // Soft delete the base product
    await Product.findByIdAndUpdate(id, {
      is_deleted: true,
      updated_at: Date.now(),
    }, { session });

    // Soft delete all associated variants
    await ProductVariant.updateMany(
      { product_id: id },
      { $set: { is_deleted: true, updated_at: Date.now() } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: message.PRODUCT.DELETE_SUCCESS,
    });
  } catch(error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

const restoreProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Base Product ID

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(404, message.PRODUCT.NOT_FOUND));
    }

    if (!product.is_deleted) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, message.PRODUCT.NOT_DELETED));
    }

    // Restore the base product
    await Product.findByIdAndUpdate(id, {
      is_deleted: false,
      updated_at: Date.now(),
    }, { session });

    // Restore all associated variants
    await ProductVariant.updateMany(
      { product_id: id },
      { $set: { is_deleted: false, updated_at: Date.now() } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: message.PRODUCT.RESTORE_SUCCESS,
    });
  } catch(error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

const searchProducts = handleAsync(async (req, res, next) => {
  const { q, limit = 10, page = 1 } = req.query;

  if (!q) {
    return next(createError(400, message.PRODUCT.SEARCH_REQUIRED));
  }
  
  // Re-use the getAllProducts logic with a required search term
  req.query.search = q;
  return getAllProducts(req, res, next);
});

const updateProductStatus = handleAsync(async (req, res, next) => {
  const { id } = req.params; // This is now a Variant ID
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const validStatuses = ["active", "inactive", "out_of_stock"];
  if (!validStatuses.includes(status)) {
    return next(createError(400, message.PRODUCT.INVALID_STATUS));
  }

  const variant = await ProductVariant.findById(id);

  if (!variant) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    { status, updated_at: Date.now() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedVariant,
    message: message.PRODUCT.UPDATE_STATUS_SUCCESS,
  });
});

// The ID in the following image routes refers to the PRODUCT VARIANT ID
const uploadProductImages = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Variant ID
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  const variant = await ProductVariant.findById(id);
  
  if (!variant) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  if (!req.files || req.files.length === 0) {
    return next(createError(400, "Vui lòng chọn ít nhất một hình ảnh để tải lên"));
  }
  
  const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
  
  let updatedImages = variant.image_gallery || [];
  updatedImages = [...updatedImages, ...imageUrls];
  
  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    { 
      image_gallery: updatedImages,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  const variantWithFullImageUrls = processProductImages(req, updatedVariant.toObject());
  const uploadedImagesWithFullUrls = imageUrls.map(img => getFullImageUrl(req, img));
  
  res.status(200).json({
    success: true,
    message: "Tải lên hình ảnh biến thể thành công",
    data: {
      variant: variantWithFullImageUrls,
      uploaded_images: uploadedImagesWithFullUrls
    }
  });
});

const updateProductMainImage = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Variant ID
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  const variant = await ProductVariant.findById(id);
  
  if (!variant) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  if (!req.file) {
    return next(createError(400, "Vui lòng chọn hình ảnh để tải lên"));
  }
  
  if (variant.image_url && variant.image_url !== "") {
    const oldImagePath = path.join(process.cwd(), variant.image_url.replace(/^\//, ""));
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
  
  const newImageUrl = `/uploads/products/${req.file.filename}`;
  
  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    { 
      image_url: newImageUrl,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  const variantWithFullImageUrls = processProductImages(req, updatedVariant.toObject());
  
  res.status(200).json({
    success: true,
    message: "Cập nhật hình ảnh chính biến thể thành công",
    data: {
      variant: variantWithFullImageUrls,
      new_image: getFullImageUrl(req, newImageUrl)
    }
  });
});

const deleteProductImage = handleAsync(async (req, res, next) => {
  const { id } = req.params; // Variant ID
  const { image_url } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  if (!image_url) {
    return next(createError(400, "URL hình ảnh là bắt buộc"));
  }
  
  const variant = await ProductVariant.findById(id);
  
  if (!variant) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  const imageGallery = variant.image_gallery || [];
  if (!imageGallery.includes(image_url)) {
    return next(createError(404, "Không tìm thấy hình ảnh trong bộ sưu tập của biến thể"));
  }
  
  const imagePath = path.join(process.cwd(), image_url.replace(/^\//, ""));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  
  const updatedGallery = imageGallery.filter(img => img !== image_url);
  
  const updatedVariant = await ProductVariant.findByIdAndUpdate(
    id,
    { 
      image_gallery: updatedGallery,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  const variantWithFullImageUrls = processProductImages(req, updatedVariant.toObject());
  
  res.status(200).json({
    success: true,
    message: "Xóa hình ảnh biến thể thành công",
    data: {
      variant: variantWithFullImageUrls
    }
  });
});

export {
  getAllProducts,
  getTrashedProducts,
  getProductById,
  getGroupedProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  searchProducts,
  updateProductStatus,
  uploadProductImages,
  updateProductMainImage,
  deleteProductImage
};
