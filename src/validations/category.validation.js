import Joi from 'joi';

export const createCategorySchema = Joi.object({
  category_name: Joi.string().required().max(50).messages({
    'string.empty': 'Tên danh mục là bắt buộc',
    'string.max': 'Tên danh mục không được vượt quá 50 ký tự',
    'any.required': 'Tên danh mục là bắt buộc'
  })
});

export const updateCategorySchema = Joi.object({
  category_name: Joi.string().required().max(50).messages({
    'string.empty': 'Tên danh mục là bắt buộc',
    'string.max': 'Tên danh mục không được vượt quá 50 ký tự',
    'any.required': 'Tên danh mục là bắt buộc'
  })
});