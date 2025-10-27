import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import * as authService from "../services/auth.service.js";

// Registrazione
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    logger.info(`Nuovo utente registrato: ${user.email}`);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    logger.info(`Utente loggato: ${result.user.email}`);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
