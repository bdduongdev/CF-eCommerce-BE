import Joi from 'joi';

export const createColorSchema = Joi.object({
  color_name: Joi.string().required().max(100).messages({
    'string.empty': 'Tên màu sắc là bắt buộc',
    'string.max': 'Tên màu sắc không được vượt quá 100 ký tự',
    'any.required': 'Tên màu sắc là bắt buộc'
  }),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá phải là số không âm',
    'any.required': 'Giá màu sắc là bắt buộc'
  })
});

export const updateColorSchema = Joi.object({
  color_name: Joi.string().max(100).messages({
    'string.max': 'Tên màu sắc không được vượt quá 100 ký tự'
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Giá phải là số',
    'number.min': 'Giá phải là số không âm'
  })
}).min(1); // Require at least one field to be present