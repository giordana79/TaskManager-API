import AppError from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message).join(", ");
    return next(new AppError(details, 400)); // passa tramite errorHandler
  }
  next();
};
