import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js"; // percorso corretto del modello

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const updatePassword = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI non configurata in .env");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connesso a MongoDB");

    // Trova l'admin esistente
    const admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      console.log("❌ Admin non trovato");
      process.exit(0);
    }

    // Aggiorna la password in chiaro
    admin.password = "admin123"; // nuova password in chiaro
    await admin.save(); // qui il pre("save") del modello farà l'hash automatico

    console.log(`✅ Password aggiornata per ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Errore:", err.message);
    process.exit(1);
  }
};

updatePassword();

//Per aggiornare la password in chiaro
