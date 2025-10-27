import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "../validation/auth.validation.js";

const router = express.Router();

// Registrazione
router.post("/register", validate(registerSchema), authController.register);

// Login (restituisce access + refresh token)
router.post("/login", validate(loginSchema), authController.login);

// Refresh access token
router.post("/refresh", validate(refreshSchema), authController.refresh);

// Logout (revoca refresh token) - PROTETTO
router.post("/logout", authMiddleware, authController.logout);

// Richiesta reset password (invia email)
router.post(
  "/request-reset",
  validate(requestResetSchema),
  authController.requestReset
);

// Reset password con token
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);

export default router;
