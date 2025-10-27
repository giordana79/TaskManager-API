import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./email.service.js";

/**
 * Genera Access Token (breve durata - 15 minuti)
 */
const generateAccessToken = (userId, email) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_SECRET non configurato", 500);

  return jwt.sign({ id: userId, email }, secret, {
    expiresIn: "15m", // 15 minuti
  });
};

/**
 * Genera Refresh Token (lunga durata - 7 giorni)
 */
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_REFRESH_SECRET non configurato", 500);

  return jwt.sign({ id: userId, type: "refresh" }, secret, {
    expiresIn: "7d", // 7 giorni
  });
};

/**
 * Registrazione utente
 */
export const registerUser = async ({ name, email, password }) => {
  // Controlla se email già esiste
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email già registrata", 409);

  // Crea nuovo utente
  const user = new User({ name, email, password });
  await user.save();

  // Invia email di benvenuto (opzionale, in background)
  sendWelcomeEmail(email, name).catch((err) => {
    console.error("Errore invio welcome email:", err);
  });

  // Restituisci utente senza password
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

/**
 * Login utente con access + refresh token
 */
export const loginUser = async ({ email, password }) => {
  // Trova utente
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email o password non corretti", 401);

  // Verifica password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Email o password non corretti", 401);

  // Pulisci refresh token scaduti
  user.cleanupExpiredRefreshTokens();

  // Genera access token (15 min)
  const accessToken = generateAccessToken(user._id, user.email);

  // Genera refresh token (7 giorni)
  const refreshToken = generateRefreshToken(user._id);

  // Salva refresh token nel DB
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 giorni
  });
  await user.save();

  // Restituisci user + tokens
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshTokens;

  return {
    user: obj,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Access Token
 * Riceve un refresh token valido e restituisce un nuovo access token
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token mancante", 401);
  }

  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  // Verifica il refresh token
  let payload;
  try {
    payload = jwt.verify(refreshToken, secret);
  } catch (err) {
    throw new AppError("Refresh token non valido o scaduto", 401);
  }

  // Controlla che sia un refresh token
  if (payload.type !== "refresh") {
    throw new AppError("Token non valido", 401);
  }

  // Trova l'utente
  const user = await User.findById(payload.id);
  if (!user) throw new AppError("Utente non trovato", 401);

  // Verifica che il refresh token sia salvato nel DB
  const tokenExists = user.refreshTokens.some(
    (rt) => rt.token === refreshToken && rt.expiresAt > Date.now()
  );

  if (!tokenExists) {
    throw new AppError("Refresh token non valido o revocato", 401);
  }

  // Genera nuovo access token
  const newAccessToken = generateAccessToken(user._id, user.email);

  return {
    accessToken: newAccessToken,
  };
};

/**
 * Logout - Revoca refresh token
 */
export const logoutUser = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Rimuovi il refresh token specifico
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken
  );
  await user.save();
};

/**
 * Richiesta reset password
 * Genera token e invia email
 */
export const requestPasswordReset = async (email) => {
  // Trova utente
  const user = await User.findOne({ email });
  if (!user) {
    // er sicurezza, non rivelare se email esiste o no
    // Simula successo anche se email non esiste
    return { message: "Se l'email esiste, riceverai le istruzioni" };
  }

  // Genera reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Invia email
  try {
    await sendPasswordResetEmail(email, resetToken);
    return { message: "Email di reset inviata con successo" };
  } catch (error) {
    // Se email fallisce, rimuovi token dal DB
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Errore invio email, riprova più tardi", 500);
  }
};

/**
 * Reset password con token
 */
export const resetPassword = async (token, newPassword) => {
  // Hash del token ricevuto
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Trova utente con token valido e non scaduto
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token non valido o scaduto", 400);
  }

  // Aggiorna password
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;

  // Pre-save hook farà l'hash della password
  await user.save();

  return { message: "Password aggiornata con successo" };
};

/**
 * Trova user by ID
 */
export const findUserById = async (id) => {
  return User.findById(id).select("-password -refreshTokens");
};
