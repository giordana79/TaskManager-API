import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import * as authService from "../services/auth.service.js";

/**
 * POST /api/auth/register
 * Registrazione nuovo utente + auto-login
 */
export const register = async (req, res, next) => {
  try {
    // Registra l'utente
    const user = await authService.registerUser(req.body);
    logger.info(`Nuovo utente registrato: ${user.email}`);

    // Auto-login dopo registrazione
    const loginResult = await authService.loginUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({
      success: true,
      user: loginResult.user,
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Login con generazione access + refresh token
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    logger.info(`Utente loggato: ${result.user.email}`);

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Rinnova access token usando refresh token
 *
 * Body: { refreshToken: "..." }
 * Response: { accessToken: "..." }
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token mancante", 400));
    }

    const result = await authService.refreshAccessToken(refreshToken);

    logger.info("Access token rinnovato");

    res.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Revoca refresh token
 *
 * Body: { refreshToken: "..." }
 * Richiede autenticazione (access token)
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id; // da authMiddleware

    await authService.logoutUser(userId, refreshToken);

    logger.info(`Utente ${userId} ha fatto logout`);

    res.json({
      success: true,
      message: "Logout effettuato",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/request-reset
 * Richiede reset password (invia email)
 *
 * Body: { email: "user@example.com" }
 */
export const requestReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email mancante", 400));
    }

    const result = await authService.requestPasswordReset(email);

    logger.info(`Reset password richiesto per: ${email}`);

    // ⚠️ Risposta generica per sicurezza
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password con token
 *
 * Body: { token: "...", newPassword: "..." }
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(new AppError("Token e password richiesti", 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError("Password minimo 6 caratteri", 400));
    }

    const result = await authService.resetPassword(token, newPassword);

    logger.info("Password resettata con successo");

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};
