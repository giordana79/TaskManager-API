/*
 * Service layer per logiche di autenticazione.
 * Qui si inseiscono le operazioni DB/complesse così i controller restano snelli.
 */

import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// funzione per creare un nuovo utente (assume che  password hashing sia gestito dal pre-save del modello)
export const registerUser = async ({ name, email, password }) => {
  // verifica esistenza utente con la stessa email
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email già registrata");
    err.status = 409; // conflict
    throw err;
  }

  // crea e salva il nuovo utente (pre-save hook hasherà la password)
  const user = new User({ name, email, password });
  await user.save();

  // non restituire la password
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

// funzione per autenticare utente e generare JWT
export const loginUser = async ({ email, password }) => {
  // cerca user per email
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Email o password non corretti");
    err.status = 401;
    throw err;
  }

  // confronta password (metodo istanza definito nello schema)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Email o password non corretti");
    err.status = 401;
    throw err;
  }

  // genera token JWT: includi userId e email; imposta expiry (es. 7d)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT secret non configurato");
    err.status = 500;
    throw err;
  }

  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  // firma il token (duration: 7 giorni)
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  // ritorna info utente senza password + token
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

// funzione utility per cercare utente per id
export const findUserById = async (id) => {
  return User.findById(id).select("-password");
};
