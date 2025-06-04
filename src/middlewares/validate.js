import createError from '../utils/createError.js';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(400, errorMessage));
  }
  
  next();
};

export default validate;