import Joi from 'joi';

export const createStorageSchema = Joi.object({
  storage_name: Joi.string().required().max(100).messages({
    'string.empty': 'Tên dung lượng là bắt buộc',
    'string.max': 'Tên dung lượng không được vượt quá 100 ký tự',
    'any.required': 'Tên dung lượng là bắt buộc'
  }),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá phải là số không âm',
    'any.required': 'Giá dung lượng là bắt buộc'
  })
});

export const updateStorageSchema = Joi.object({
  storage_name: Joi.string().max(100).messages({
    'string.max': 'Tên dung lượng không được vượt quá 100 ký tự'
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá phải là số không âm'
  })
}).min(1); // Require at least one field to be present