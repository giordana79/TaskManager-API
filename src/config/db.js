// Connessione a MongoDB con mongoose

import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI; // prendo URI dal .env
    if (!uri) throw new Error("MONGO_URI non impostata in .env");

    // Connessione a MongoDB (opzioni moderne Mongoose 7 non necessarie)
    await mongoose.connect(uri);

    logger.info("✅ MongoDB connesso"); // log su console e file
  } catch (err) {
    logger.error("Errore connessione MongoDB: " + err.message);
    process.exit(1); // chiude il server se DB non raggiungibile
  }
};

export default connectDB;
