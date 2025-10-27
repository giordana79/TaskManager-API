// Logica business autenticazione

import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// Registrazione
export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email già registrata", 409);

  const user = new User({ name, email, password });
  await user.save();

  const obj = user.toObject();
  delete obj.password; // non restituire password
  return obj;
};

// Login
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Email o password non corretti", 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Email o password non corretti", 401);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_SECRET non configurato", 500);

  const token = jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: "7d",
  });

  const obj = user.toObject();
  delete obj.password;

  return { user: obj, token };
};

// Trova user by ID
export const findUserById = async (id) => {
  return User.findById(id).select("-password");
};
