import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const createProductSchema = Joi.object({
  product_name: Joi.string().required().max(100).messages({
    'string.empty': 'Tên sản phẩm là bắt buộc',
    'string.max': 'Tên sản phẩm không được vượt quá 100 ký tự',
    'any.required': 'Tên sản phẩm là bắt buộc'
  }),
  slug: Joi.string().max(100).messages({
    'string.max': 'Slug không được vượt quá 100 ký tự'
  }),
  description: Joi.string().allow(''),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá sản phẩm phải là số dương',
    'any.required': 'Giá sản phẩm là bắt buộc'
  }),
  stock_quantity: Joi.number().min(0).default(0).messages({
    'number.base': 'Số lượng tồn kho phải là số',
    'number.min': 'Số lượng tồn kho phải là số không âm'
  }),
  status: Joi.string().valid('active', 'inactive', 'out_of_stock', 'discontinued').default('active').messages({
    'any.only': 'Trạng thái sản phẩm không hợp lệ'
  }),
  category_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID danh mục không hợp lệ'
  }),
  color_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID màu sắc không hợp lệ'
  }),
  storage_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID bộ nhớ không hợp lệ'
  }),
  image_url: Joi.string().max(255).allow('').messages({
    'string.max': 'URL hình ảnh không được vượt quá 255 ký tự'
  })
});

export const updateProductSchema = Joi.object({
  product_name: Joi.string().max(100).messages({
    'string.max': 'Tên sản phẩm không được vượt quá 100 ký tự'
  }),
  slug: Joi.string().max(100).messages({
    'string.max': 'Slug không được vượt quá 100 ký tự'
  }),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá sản phẩm phải là số dương'
  }),
  stock_quantity: Joi.number().min(0).messages({
    'number.base': 'Số lượng tồn kho phải là số',
    'number.min': 'Số lượng tồn kho phải là số không âm'
  }),
  status: Joi.string().valid('active', 'inactive', 'out_of_stock', 'discontinued').messages({
    'any.only': 'Trạng thái sản phẩm không hợp lệ'
  }),
  category_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID danh mục không hợp lệ'
  }),
  color_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID màu sắc không hợp lệ'
  }),
  storage_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID bộ nhớ không hợp lệ'
  }),
  image_url: Joi.string().max(255).allow('').messages({
    'string.max': 'URL hình ảnh không được vượt quá 255 ký tự'
  })
}).min(1);
  
export const updateProductStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'out_of_stock', 'discontinued').required().messages({
    'any.required': 'Trạng thái sản phẩm là bắt buộc',
    'any.only': 'Trạng thái sản phẩm không hợp lệ'
  })
});

export const deleteProductImageSchema = Joi.object({
  image_url: Joi.string().required().messages({
    'string.empty': 'URL hình ảnh là bắt buộc',
    'any.required': 'URL hình ảnh là bắt buộc'
  })
});