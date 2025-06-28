import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const objectIdArrayValidator = (value, helpers) => {
  if (!Array.isArray(value)) {
    return helpers.error('any.invalid');
  }
  
  for (const id of value) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return helpers.error('any.invalid');
    }
  }
  return value;
};

export const createDiscountSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).min(1).messages({
    'array.min': 'Phải chọn ít nhất 1 sản phẩm',
    'any.invalid': 'ID sản phẩm không hợp lệ'
  }),
  discount_type: Joi.string().required().valid('percentage', 'fixed').max(20).messages({
    'string.empty': 'Loại giảm giá là bắt buộc',
    'string.max': 'Loại giảm giá không được vượt quá 20 ký tự',
    'any.only': 'Loại giảm giá phải là percentage hoặc fixed',
    'any.required': 'Loại giảm giá là bắt buộc'
  }),
  discount_value: Joi.number().required().min(0).messages({
    'number.base': 'Giá trị giảm giá phải là số',
    'number.min': 'Giá trị giảm giá phải là số không âm',
    'any.required': 'Giá trị giảm giá là bắt buộc'
  }),
  start_date: Joi.date().required().messages({
    'date.base': 'Ngày bắt đầu phải là ngày hợp lệ',
    'any.required': 'Ngày bắt đầu là bắt buộc'
  }),
  end_date: Joi.date().required().greater(Joi.ref('start_date')).messages({
    'date.base': 'Ngày kết thúc phải là ngày hợp lệ',
    'any.required': 'Ngày kết thúc là bắt buộc',
    'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu'
  }),
  description: Joi.string().allow('').messages({
    'string.base': 'Mô tả phải là chuỗi'
  }),
  is_active: Joi.boolean().default(true).messages({
    'boolean.base': 'Trạng thái hoạt động phải là boolean'
  })
});

export const updateDiscountSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).messages({
    'any.invalid': 'ID sản phẩm không hợp lệ'
  }),
  discount_type: Joi.string().valid('percentage', 'fixed').max(20).messages({
    'string.max': 'Loại giảm giá không được vượt quá 20 ký tự',
    'any.only': 'Loại giảm giá phải là percentage hoặc fixed'
  }),
  discount_value: Joi.number().min(0).messages({
    'number.base': 'Giá trị giảm giá phải là số',
    'number.min': 'Giá trị giảm giá phải là số không âm'
  }),
  start_date: Joi.date().messages({
    'date.base': 'Ngày bắt đầu phải là ngày hợp lệ'
  }),
  end_date: Joi.date().greater(Joi.ref('start_date')).messages({
    'date.base': 'Ngày kết thúc phải là ngày hợp lệ',
    'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu'
  }),
  description: Joi.string().allow('').messages({
    'string.base': 'Mô tả phải là chuỗi'
  }),
  is_active: Joi.boolean().messages({
    'boolean.base': 'Trạng thái hoạt động phải là boolean'
  })
}).min(1);

export const getDiscountsSchema = Joi.object({
  product_id: Joi.string().custom(objectIdValidator).messages({
    'any.invalid': 'ID sản phẩm không hợp lệ'
  }),
  discount_type: Joi.string().valid('percentage', 'fixed').messages({
    'any.only': 'Loại giảm giá phải là percentage hoặc fixed'
  }),
  status: Joi.string().valid('active', 'inactive', 'expired', 'upcoming').messages({
    'any.only': 'Trạng thái không hợp lệ'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit phải là số',
    'number.integer': 'Limit phải là số nguyên',
    'number.min': 'Limit phải lớn hơn 0',
    'number.max': 'Limit không được vượt quá 100'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page phải là số',
    'number.integer': 'Page phải là số nguyên',
    'number.min': 'Page phải lớn hơn 0'
  })
});

export const addProductsToDiscountSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).min(1).required().messages({
    'array.min': 'Phải chọn ít nhất 1 sản phẩm',
    'any.required': 'Danh sách sản phẩm là bắt buộc',
    'any.invalid': 'ID sản phẩm không hợp lệ'
  })
});

export const removeProductsFromDiscountSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).min(1).required().messages({
    'array.min': 'Phải chọn ít nhất 1 sản phẩm',
    'any.required': 'Danh sách sản phẩm là bắt buộc',
    'any.invalid': 'ID sản phẩm không hợp lệ'
  })
});
