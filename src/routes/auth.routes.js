// definisce le rotte /api/auth/register e /api/auth/login
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";

const router = express.Router();

/*
 * POST /api/auth/register
 * - valida input con Joi (registerSchema)
 * - chiama authController.register
 */
router.post("/register", validate(registerSchema), authController.register);

/*
 * POST /api/auth/login
 * - valida input con Joi (loginSchema)
 * - chiama authController.login
 */
router.post("/login", validate(loginSchema), authController.login);

export default router;
