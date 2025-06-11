import Banner from "../models/Banner.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllBanners = handleAsync(async (req, res, next) => {
  const { limit = 10, page = 1, is_active } = req.query;

  const query = { is_deleted: false };

  if (is_active !== undefined) {
    query.is_active = is_active === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const banners = await Banner.find(query)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Banner.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      banners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
    message: message.BANNER.GET_ALL_SUCCESS,
  });
});

const getTrashedBanners = handleAsync(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;

  const query = { is_deleted: true };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const banners = await Banner.find(query)
    .sort({ updated_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Banner.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      banners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
    message: message.BANNER.GET_TRASHED_SUCCESS,
  });
});

const getBannerById = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.BANNER.INVALID_ID));
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(createError(404, message.BANNER.NOT_FOUND));
  }

  res.status(200).json({
    success: true,
    data: banner,
    message: message.BANNER.GET_BY_ID_SUCCESS,
  });
});

const createBanner = handleAsync(async (req, res, next) => {
  const {
    title,
    image_url,
    link_url,
    position,
    is_active,
    start_date,
    end_date,
  } = req.body;

  const newBanner = await Banner.create({
    title,
    image_url,
    link_url,
    position,
    is_active: is_active !== undefined ? is_active : true,
    start_date,
    end_date,
  });

  res.status(201).json({
    success: true,
    data: newBanner,
    message: message.BANNER.CREATE_SUCCESS,
  });
});

const updateBanner = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.BANNER.INVALID_ID));
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(createError(404, message.BANNER.NOT_FOUND));
  }

  if (banner.is_deleted) {
    return next(createError(400, message.BANNER.CANNOT_UPDATE_DELETED));
  }

  updateData.updated_at = Date.now();

  const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedBanner,
    message: message.BANNER.UPDATE_SUCCESS,
  });
});

const deleteBanner = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.BANNER.INVALID_ID));
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(createError(404, message.BANNER.NOT_FOUND));
  }

  if (banner.is_deleted) {
    return next(createError(400, message.BANNER.ALREADY_DELETED));
  }

  await Banner.findByIdAndUpdate(id, {
    is_deleted: true,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.BANNER.DELETE_SUCCESS,
  });
});

const restoreBanner = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.BANNER.INVALID_ID));
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(createError(404, message.BANNER.NOT_FOUND));
  }

  if (!banner.is_deleted) {
    return next(createError(400, message.BANNER.NOT_DELETED));
  }

  await Banner.findByIdAndUpdate(id, {
    is_deleted: false,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.BANNER.RESTORE_SUCCESS,
  });
});

const toggleBannerStatus = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.BANNER.INVALID_ID));
  }

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(createError(404, message.BANNER.NOT_FOUND));
  }

  if (banner.is_deleted) {
    return next(createError(400, message.BANNER.CANNOT_UPDATE_DELETED));
  }

  await Banner.findByIdAndUpdate(id, {
    is_active: !banner.is_active,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.BANNER.TOGGLE_STATUS_SUCCESS,
  });
});

export {
  getAllBanners,
  getTrashedBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  restoreBanner,
  toggleBannerStatus,
};
