import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const addToCartSchema = Joi.object({
  variantId: Joi.string().hex().length(24).required().messages({
    'string.base': 'ID biến thể sản phẩm phải là một chuỗi',
    'string.hex': 'ID biến thể sản phẩm phải là một chuỗi hex',
    'string.length': 'ID biến thể sản phẩm phải có độ dài 24 ký tự',
    'any.required': 'ID biến thể sản phẩm là bắt buộc'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Số lượng phải là một số',
    'number.integer': 'Số lượng phải là một số nguyên',
    'number.min': 'Số lượng phải lớn hơn hoặc bằng 1',
    'any.required': 'Số lượng là bắt buộc'
  })
});
