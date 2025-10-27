import Joi from "joi";

// Registrazione
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Refresh token
export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Richiesta reset password
export const requestResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Reset password
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
