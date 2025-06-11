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
        const [field, order] = sort.split(':');
        sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
        sortOptions = { review_date: -1 };
    }
    
    const reviews = await Review.find(query)
        .select('user_id product_id rating comment review_date')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user_id', 'fullname email')
        .populate('product_id', 'product_name');
    
    const total = await Review.countDocuments(query);
    
    res.status(200).json({
        success: true,
        data: {
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        },
        message: message.REVIEW?.GET_ALL_SUCCESS || "Lấy tất cả đánh giá thành công"
    });
});

const createReview = handleAsync(async (req, res, next) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
        return next(createError(400, "Sản phẩm và đánh giá là bắt buộc"));
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ user_id, product_id });
    if (existingReview) {
        return next(createError(400, "Bạn đã đánh giá sản phẩm này rồi"));
    }

    const review = new Review({
        user_id,
        product_id,
        rating,
        comment
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
        .populate('user_id', 'fullname email')
        .populate('product_id', 'product_name');

    res.status(201).json({
        success: true,
        data: populatedReview,
        message: message.REVIEW?.CREATE_SUCCESS || "Thêm đánh giá thành công"
    });
});

export { getAllReviews, createReview };