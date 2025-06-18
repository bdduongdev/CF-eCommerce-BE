import Product from "../models/Product.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";
import fs from "fs";
import path from "path";
import ProductColor from "../models/ProductColor.js";
import ProductStorage from "../models/ProductStorage.js";

// Helper function to convert relative image paths to full URLs
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  
  // If the imagePath already has the protocol and host, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If imagePath starts with a slash, remove it
  const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Construct the full URL
  return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
};

// Helper function to process product images (for individual product)
const processProductImages = (req, product) => {
  if (!product) return product;
  
  const productObj = { ...product };
  
  // Convert main image URL to full URL
  if (productObj.image_url) {
    productObj.image_url = getFullImageUrl(req, productObj.image_url);
  }
  
  // Convert gallery images to full URLs
  if (productObj.image_gallery && Array.isArray(productObj.image_gallery)) {
    productObj.image_gallery = productObj.image_gallery.map(img => getFullImageUrl(req, img));
  }
  
  return productObj;
};

// Helper function to process multiple products
const processProductsImages = (req, products) => {
  if (!products || !Array.isArray(products)) return products;
  
  return products.map(product => {
    const productObj = { ...product };
    
    // Convert main image URL to full URL
    if (productObj.image_url) {
      productObj.image_url = getFullImageUrl(req, productObj.image_url);
    }
    
    // Convert gallery images to full URLs
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
  } = req.query;

  const query = { is_deleted: false };

  if (category) {
    query.category_id = category;
  }

  if (search) {
    query.$or = [
      { product_name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(":");
    sortOptions[field] = order === "desc" ? -1 : 1;
  } else {
    sortOptions = { created_at: -1 };
  }

  const products = await Product.find(query)
    .sort(sortOptions)
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

  // Process image URLs to full URLs
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
    message: message.PRODUCT.GET_ALL_SUCCESS,
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

  // Process image URLs to full URLs
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
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate("category_id", "category_name")
    .populate("color_id", "color_name price")
    .populate("storage_id", "storage_name price");

  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  const productObj = product.toObject();
  const basePrice = productObj.price || 0;
  const colorPrice = productObj.color_id?.price || 0;
  const storagePrice = productObj.storage_id?.price || 0;
  productObj.total_price = basePrice + colorPrice + storagePrice;
  
  // Ensure image_gallery is always an array
  if (!productObj.image_gallery) {
    productObj.image_gallery = [];
  }

  // Process image URLs to full URLs
  const productWithFullImageUrls = processProductImages(req, productObj);

  res.status(200).json({
    success: true,
    data: productWithFullImageUrls,
    message: message.PRODUCT.GET_BY_ID_SUCCESS,
  });
});

const createProduct = handleAsync(async (req, res, next) => {
  const {
    product_name,
    slug,
    description,
    price,
    stock_quantity,
    category_id,
    color_id,
    storage_id,
    status,
  } = req.body;

  try {
    let productStatus = status;
    if (stock_quantity === 0 && !status) {
      productStatus = "out_of_stock";
    }

    let image_url = "/uploads/products/default-product.jpg";
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    let productSlug = slug;
    if (!productSlug && product_name) {
      productSlug = product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const newProduct = await Product.create({
      product_name,
      slug: productSlug,
      description: description || "",
      price,
      stock_quantity: stock_quantity || 0,
      category_id,
      color_id,
      storage_id,
      image_url,
      image_gallery: image_url !== "/uploads/products/default-product.jpg" ? [image_url] : [],
      status: productStatus || "active",
    });

    // Process image URLs to full URLs
    const productWithFullImageUrls = processProductImages(req, newProduct.toObject());

    res.status(201).json({
      success: true,
      data: productWithFullImageUrls,
      message: message.PRODUCT.CREATE_SUCCESS,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return next(createError(400, messages.join(", ")));
    }
    return next(error);
  }
});

const updateProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  if (updateData.stock_quantity === 0 && !updateData.status) {
    updateData.status = "out_of_stock";
  }

  if (updateData.product_name && !updateData.slug) {
    updateData.slug = updateData.product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }

  if (req.file) {
    // Remove old main image if it exists and is not the default image
    if (product.image_url && 
        product.image_url !== "" && 
        product.image_url !== "/uploads/products/default-product.jpg") {
      const oldImagePath = path.join(
        process.cwd(),
        product.image_url.replace(/^\//, "")
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    updateData.image_url = `/uploads/products/${req.file.filename}`;
    
    // Also add to image gallery if not already there
    const gallery = product.image_gallery || [];
    if (!gallery.includes(updateData.image_url)) {
      updateData.image_gallery = [...gallery, updateData.image_url];
    }
  }

  updateData.updated_at = Date.now();

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  // Process image URLs to full URLs
  const productWithFullImageUrls = processProductImages(req, updatedProduct.toObject());

  res.status(200).json({
    success: true,
    data: productWithFullImageUrls,
    message: message.PRODUCT.UPDATE_SUCCESS,
  });
});

const deleteProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  if (product.is_deleted) {
    return next(createError(400, message.PRODUCT.ALREADY_DELETED));
  }

  await Product.findByIdAndUpdate(id, {
    is_deleted: true,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.PRODUCT.DELETE_SUCCESS,
  });
});

const restoreProduct = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  if (!product.is_deleted) {
    return next(createError(400, message.PRODUCT.NOT_DELETED));
  }

  await Product.findByIdAndUpdate(id, {
    is_deleted: false,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.PRODUCT.RESTORE_SUCCESS,
  });
});

const searchProducts = handleAsync(async (req, res, next) => {
  const { q, limit = 10, page = 1, status } = req.query;

  if (!q) {
    return next(createError(400, message.PRODUCT.SEARCH_REQUIRED));
  }

  const query = {
    $or: [
      { product_name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } }
    ],
    is_deleted: false,
  };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(query)
    .sort({ created_at: -1 })
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

  // Process image URLs to full URLs
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
    message: message.PRODUCT.SEARCH_SUCCESS,
  });
});

const updateProductStatus = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }

  const validStatuses = ["active", "inactive", "out_of_stock", "discontinued"];
  if (!validStatuses.includes(status)) {
    return next(createError(400, message.PRODUCT.INVALID_STATUS));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { status, updated_at: Date.now() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: message.PRODUCT.UPDATE_STATUS_SUCCESS,
  });
});

const getProductBySlug = handleAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { storage, color } = req.query;

  const product = await Product.findOne({
    slug: slug,
    is_deleted: false
  }).populate("category_id", "category_name");

  if (!product) {
    return next(createError(404, "Không tìm thấy sản phẩm"));
  }

  const colors = await ProductColor.find({ is_deleted: false });
  
  const storages = await ProductStorage.find({ is_deleted: false });
  
  const variants = [];
  for (const colorOption of colors) {
    for (const storageOption of storages) {
      variants.push({
        storage: storageOption.storage_name,
        color: colorOption.color_name,
        price: product.price + colorOption.price + storageOption.price,
        image: getFullImageUrl(req, product.image_url),
        color_id: colorOption._id,
        storage_id: storageOption._id
      });
    }
  }

  let selectedVariant = null;
  if (storage && color) {
    selectedVariant = variants.find(
      variant => 
        variant.storage.toLowerCase() === storage.toLowerCase() &&
        variant.color.toLowerCase() === color.toLowerCase()
    );
  }

  const productResponse = {
    _id: product._id,
    name: product.product_name,
    slug: product.slug,
    description: product.description,
    base_price: product.price,
    stock_quantity: product.stock_quantity,
    status: product.status,
    category: product.category_id,
    image_url: getFullImageUrl(req, product.image_url),
    image_gallery: (product.image_gallery || []).map(img => getFullImageUrl(req, img)),
    created_at: product.created_at,
    updated_at: product.updated_at
  };

  res.status(200).json({
    success: true,
    data: {
      product: productResponse,
      variants: variants,
      selectedVariant: selectedVariant
    },
    message: "Lấy thông tin sản phẩm thành công"
  });
});

const uploadProductImages = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  if (!req.files || req.files.length === 0) {
    return next(createError(400, "Vui lòng chọn ít nhất một hình ảnh để tải lên"));
  }
  
  const imageUrls = [];
  
  // Process each uploaded file
  req.files.forEach(file => {
    imageUrls.push(`/uploads/products/${file.filename}`);
  });
  
  // Add images to product's image gallery
  let updatedImages = product.image_gallery || [];
  updatedImages = [...updatedImages, ...imageUrls];
  
  // Update the product with new images
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { 
      image_gallery: updatedImages,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  // Process image URLs to full URLs
  const productWithFullImageUrls = processProductImages(req, updatedProduct.toObject());
  const uploadedImagesWithFullUrls = imageUrls.map(img => getFullImageUrl(req, img));
  
  res.status(200).json({
    success: true,
    message: "Tải lên hình ảnh sản phẩm thành công",
    data: {
      product: productWithFullImageUrls,
      uploaded_images: uploadedImagesWithFullUrls
    }
  });
});

const updateProductMainImage = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  if (!req.file) {
    return next(createError(400, "Vui lòng chọn hình ảnh để tải lên"));
  }
  
  // Remove old main image if it exists
  if (product.image_url && product.image_url !== "" && product.image_url !== "/uploads/products/default-product.jpg") {
    const oldImagePath = path.join(
      process.cwd(),
      product.image_url.replace(/^\//, "")
    );
    
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
  
  const newImageUrl = `/uploads/products/${req.file.filename}`;
  
  // Update the product with new main image
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { 
      image_url: newImageUrl,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  // Process image URLs to full URLs
  const productWithFullImageUrls = processProductImages(req, updatedProduct.toObject());
  
  res.status(200).json({
    success: true,
    message: "Cập nhật hình ảnh chính sản phẩm thành công",
    data: {
      product: productWithFullImageUrls,
      new_image: getFullImageUrl(req, newImageUrl)
    }
  });
});

const deleteProductImage = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const { image_url } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT.INVALID_ID));
  }
  
  if (!image_url) {
    return next(createError(400, "URL hình ảnh là bắt buộc"));
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(createError(404, message.PRODUCT.NOT_FOUND));
  }
  
  // Check if image exists in gallery
  const imageGallery = product.image_gallery || [];
  if (!imageGallery.includes(image_url)) {
    return next(createError(404, "Không tìm thấy hình ảnh trong bộ sưu tập của sản phẩm"));
  }
  
  // Delete file from server
  const imagePath = path.join(
    process.cwd(),
    image_url.replace(/^\//, "")
  );
  
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  
  // Remove image from gallery
  const updatedGallery = imageGallery.filter(img => img !== image_url);
  
  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { 
      image_gallery: updatedGallery,
      updated_at: Date.now()
    },
    { new: true }
  );
  
  // Process image URLs to full URLs
  const productWithFullImageUrls = processProductImages(req, updatedProduct.toObject());
  
  res.status(200).json({
    success: true,
    message: "Xóa hình ảnh sản phẩm thành công",
    data: {
      product: productWithFullImageUrls
    }
  });
});

export {
  getAllProducts,
  getTrashedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  searchProducts,
  updateProductStatus,
  getProductBySlug,
  uploadProductImages,
  updateProductMainImage,
  deleteProductImage
};
