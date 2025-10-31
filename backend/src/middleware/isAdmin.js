import user from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Accesso negato: serve ruolo admin", 403));
  }
  next();
};

export default isAdmin;
