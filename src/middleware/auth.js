// Middleware per proteggere rotte con JWT

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization; // leggo header Authorization
    if (!header || !header.startsWith("Bearer "))
      return next(new AppError("Token mancante o formato non valido", 401));

    const token = header.split(" ")[1]; // estraggo token
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new AppError("JWT_SECRET non configurato", 500));

    let payload;
    try {
      payload = jwt.verify(token, secret); // verifico token
    } catch {
      return next(new AppError("Token non valido o scaduto", 401));
    }

    // carico utente e attacco info minime a req.user
    const user = await User.findById(payload.id).select("-password");
    if (!user) return next(new AppError("Utente non trovato", 401));

    req.user = { id: user._id.toString(), email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
