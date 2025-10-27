import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Token di autenticazione mancante", 401));
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError("Token non valido o scaduto", 401));
    }

    // Recupera utente
    const user = await User.findById(payload.id).select(
      "-password -refreshTokens"
    );
    if (!user) return next(new AppError("Utente non trovato", 401));

    req.user = user; // aggiunge info utente alla request
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
