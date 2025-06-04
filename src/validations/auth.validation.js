import Joi from 'joi';
import { EMAIL_REGEX, PHONE_REGEX } from '../constants/regex.js';

// Định nghĩa các schema validation cho các route authentication
export const loginSchema = Joi.object({
  email: Joi.string().required().pattern(EMAIL_REGEX).messages({
    'string.empty': 'Email là bắt buộc',
    'string.pattern.base': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Mật khẩu là bắt buộc',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  })
});

export const registerSchema = Joi.object({
  fullname: Joi.string().required().messages({
    'string.empty': 'Họ tên là bắt buộc',
    'any.required': 'Họ tên là bắt buộc'
  }),
  email: Joi.string().required().pattern(EMAIL_REGEX).messages({
    'string.empty': 'Email là bắt buộc',
    'string.pattern.base': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Mật khẩu là bắt buộc',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'string.empty': 'Xác nhận mật khẩu là bắt buộc',
    'any.only': 'Xác nhận mật khẩu không khớp',
    'any.required': 'Xác nhận mật khẩu là bắt buộc'
  }),
  phone: Joi.string().allow('').pattern(PHONE_REGEX).messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ'
  }),
  address: Joi.string().allow('')
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().pattern(EMAIL_REGEX).messages({
    'string.empty': 'Email là bắt buộc',
    'string.pattern.base': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  })
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Mật khẩu là bắt buộc',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'string.empty': 'Xác nhận mật khẩu là bắt buộc',
    'any.only': 'Xác nhận mật khẩu không khớp',
    'any.required': 'Xác nhận mật khẩu là bắt buộc'
  })
});

export const verifyEmailSchema = Joi.object({
  verificationToken: Joi.string().required().messages({
    'string.empty': 'Mã xác thực là bắt buộc',
    'any.required': 'Mã xác thực là bắt buộc'
  })
});