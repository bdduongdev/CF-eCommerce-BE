import ProductStorage from "../models/ProductStorage.js";
import createError from "../utils/createError.js";
import handleAsync from "../utils/handleAsync.js";
import mongoose from "mongoose";
import message from "../constants/index.js";

const getAllStorages = handleAsync(async (req, res, next) => {
  const storages = await ProductStorage.find({ is_deleted: false }).sort({
    storage_name: 1,
  });

  res.status(200).json({
    success: true,
    data: storages,
    message: message.PRODUCT_STORAGE.GET_ALL_SUCCESS,
  });
});

const getTrashedStorages = handleAsync(async (req, res, next) => {
  const storages = await ProductStorage.find({ is_deleted: true }).sort({
    updated_at: -1,
  });

  res.status(200).json({
    success: true,
    data: storages,
    message: message.PRODUCT_STORAGE.GET_TRASHED_SUCCESS,
  });
});

const getStorageById = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT_STORAGE.INVALID_ID));
  }

  const storage = await ProductStorage.findById(id);

  if (!storage) {
    return next(createError(404, message.PRODUCT_STORAGE.NOT_FOUND));
  }

  res.status(200).json({
    success: true,
    data: storage,
    message: message.PRODUCT_STORAGE.GET_BY_ID_SUCCESS,
  });
});

const createStorage = handleAsync(async (req, res, next) => {
  const { storage_name, price } = req.body;

  const newStorage = await ProductStorage.create({
    storage_name,
    price,
  });

  res.status(201).json({
    success: true,
    data: newStorage,
    message: message.PRODUCT_STORAGE.CREATE_SUCCESS,
  });
});

const updateStorage = handleAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT_STORAGE.INVALID_ID));
  }

  const storage = await ProductStorage.findById(id);

  if (!storage) {
    return next(createError(404, message.PRODUCT_STORAGE.NOT_FOUND));
  }

  updateData.updated_at = Date.now();

  const updatedStorage = await ProductStorage.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedStorage,
    message: message.PRODUCT_STORAGE.UPDATE_SUCCESS,
  });
});

const deleteStorage = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT_STORAGE.INVALID_ID));
  }

  const storage = await ProductStorage.findById(id);

  if (!storage) {
    return next(createError(404, message.PRODUCT_STORAGE.NOT_FOUND));
  }

  await ProductStorage.findByIdAndUpdate(id, {
    is_deleted: true,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.PRODUCT_STORAGE.DELETE_SUCCESS,
  });
});

const restoreStorage = handleAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, message.PRODUCT_STORAGE.INVALID_ID));
  }

  const storage = await ProductStorage.findById(id);

  if (!storage) {
    return next(createError(404, message.PRODUCT_STORAGE.NOT_FOUND));
  }

  if (!storage.is_deleted) {
    return next(createError(400, message.PRODUCT_STORAGE.NOT_DELETED));
  }

  await ProductStorage.findByIdAndUpdate(id, {
    is_deleted: false,
    updated_at: Date.now(),
  });

  res.status(200).json({
    success: true,
    message: message.PRODUCT_STORAGE.RESTORE_SUCCESS,
  });
});

export {
  getAllStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getTrashedStorages,
  restoreStorage,
};
