import createError from '../utils/createError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const dataToValidate = req[source];
  const { error } = schema.validate(dataToValidate, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(400, errorMessage));
  }
  
  next();
};

export default validate;