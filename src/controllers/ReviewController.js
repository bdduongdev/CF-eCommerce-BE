import Review from "../models/Review.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllReviews = handleAsync(async (req, res, next) => {
  const { product_id, user_id, rating, sort, limit = 10, page = 1 } = req.query;

  const query = {};

  if (product_id) {
    query.product_id = product_id;
  }

  if (user_id) {
    query.user_id = user_id;
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let sortOptions = {};
  if (sort) {
    const [field, order] = sort.split(":");
    sortOptions[field] = order === "desc" ? -1 : 1;
  } else {
    sortOptions = { review_date: -1 };
  }

  const reviews = await Review.find(query)
    .select("user_id product_id rating comment review_date")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user_id", "fullname email")
    .populate("product_id", "product_name");

  const total = await Review.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
    message:
      message.REVIEW?.GET_ALL_SUCCESS || "Lấy tất cả đánh giá thành công",
  });
});

const createReview = handleAsync(async (req, res, next) => {
  const { variant_id, product_id, user_id, rating, comment } = req.body;
  if (!variant_id || !user_id || !rating) {
    return next(createError(400, 'Thiếu thông tin đánh giá.'));
  }
  const review = new Review({
    variant_id,
    product_id,
    user_id,
    rating,
    comment
  });
  await review.save();
  res.status(201).json({
    success: true,
    message: 'Tạo đánh giá thành công!',
    data: review
  });
});

const getReviewsByVariant = handleAsync(async (req, res, next) => {
  const { variant_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(variant_id)) {
    return next(createError(400, 'ID biến thể không hợp lệ.'));
  }
  const reviews = await Review.find({ variant_id }).populate('user_id', 'name email');
  res.status(200).json({
    success: true,
    message: message.REVIEW.GET_ALL_SUCCESS,
    data: reviews
  });
});

const getReviewsByProduct = handleAsync(async (req, res, next) => {
  const { product_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(product_id)) {
    return next(createError(400, 'ID sản phẩm không hợp lệ.'));
  }
  const reviews = await Review.find({ product_id }).populate('user_id', 'name email');
  res.status(200).json({
    success: true,
    message: message.REVIEW.GET_ALL_SUCCESS,
    data: reviews
  });
});

const updateReview = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, 'ID đánh giá không hợp lệ.'));
  }
  const updateData = req.body;
  const review = await Review.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!review) {
    return next(createError(404, 'Không tìm thấy đánh giá.'));
  }
  res.status(200).json({
    success: true,
    message: 'Cập nhật đánh giá thành công!',
    data: review
  });
});

const deleteReview = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, 'ID đánh giá không hợp lệ.'));
  }
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    return next(createError(404, 'Không tìm thấy đánh giá.'));
  }
  res.status(200).json({
    success: true,
    message: 'Xóa đánh giá thành công!'
  });
});

export {
  getAllReviews,
  createReview,
  getReviewsByVariant,
  getReviewsByProduct,
  updateReview,
  deleteReview
};
