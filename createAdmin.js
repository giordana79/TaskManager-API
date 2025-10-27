import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./src/models/user.model.js";

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log("✅ Connesso a MongoDB");

const email = "admin@example.com";
const password = "admin123"; // password in chiaro

// Controlla se esiste già
let admin = await User.findOne({ email });
if (!admin) {
  admin = await User.create({ name: "Admin", email, password, role: "admin" });
  console.log("✅ Admin creato:", email);
} else {
  console.log("⚠️ Admin già esistente:", email);
}

process.exit();

//per creare un utente admin
