import Joi from 'joi';

export const createReviewSchema = Joi.object({
  variant_id: Joi.string().required(),
  product_id: Joi.string().optional(),
  user_id: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional()
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().allow('').optional()
}); 