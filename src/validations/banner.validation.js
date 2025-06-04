import Joi from 'joi';

export const createBannerSchema = Joi.object({
  title: Joi.string().max(100).messages({
    'string.max': 'Tiêu đề không được vượt quá 100 ký tự'
  }),
  image_url: Joi.string().required().max(255).messages({
    'string.empty': 'URL hình ảnh là bắt buộc',
    'string.max': 'URL hình ảnh không được vượt quá 255 ký tự',
    'any.required': 'URL hình ảnh là bắt buộc'
  }),
  link_url: Joi.string().max(255).allow('').messages({
    'string.max': 'URL liên kết không được vượt quá 255 ký tự'
  }),
  position: Joi.string().max(50).allow('').messages({
    'string.max': 'Vị trí không được vượt quá 50 ký tự'
  }),
  is_active: Joi.boolean(),
  start_date: Joi.date(),
  end_date: Joi.date().min(Joi.ref('start_date')).messages({
    'date.min': 'Ngày kết thúc phải sau ngày bắt đầu'
  })
});

export const updateBannerSchema = Joi.object({
  title: Joi.string().max(100).messages({
    'string.max': 'Tiêu đề không được vượt quá 100 ký tự'
  }),
  image_url: Joi.string().max(255).messages({
    'string.max': 'URL hình ảnh không được vượt quá 255 ký tự'
  }),
  link_url: Joi.string().max(255).allow('').messages({
    'string.max': 'URL liên kết không được vượt quá 255 ký tự'
  }),
  position: Joi.string().max(50).allow('').messages({
    'string.max': 'Vị trí không được vượt quá 50 ký tự'
  }),
  is_active: Joi.boolean(),
  start_date: Joi.date(),
  end_date: Joi.date().min(Joi.ref('start_date')).messages({
    'date.min': 'Ngày kết thúc phải sau ngày bắt đầu'
  })
});

export const toggleStatusSchema = Joi.object({});