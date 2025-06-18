import Joi from 'joi';
import { EMAIL_REGEX, PHONE_REGEX } from '../constants/regex.js';

export const userCreateSchema = Joi.object({
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
    phone: Joi.string().allow('').pattern(PHONE_REGEX).messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ'
    }),
    address: Joi.string().allow(''),
    gender: Joi.string().valid('male', 'female', 'other'),
    dateOfBirth: Joi.date(),
    role: Joi.string().valid('admin', 'customer'),
    avatar: Joi.string(),
    detailedAddress: Joi.object({
        street: Joi.string(),
        ward: Joi.string(),
        district: Joi.string(),
        city: Joi.string(),
        country: Joi.string()
    })
});

export const userUpdateSchema = Joi.object({
    role: Joi.string().valid('admin', 'customer').required().messages({
        'string.empty': 'Vai trò là bắt buộc',
        'any.required': 'Vai trò là bắt buộc',
        'any.only': 'Vai trò không hợp lệ'
    })
});
