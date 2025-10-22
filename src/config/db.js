// import mongoose per la connessione a MongoDB
import mongoose from "mongoose";

// funzione che stabilisce la connessione a MongoDB usando MONGO_URI
export const connectDB = async () => {
  try {
    // legge la variabile di ambiente MONGO_URI (settata in .env)
    const uri = process.env.MONGO_URI;

    // se manca la URI logga e termina l'app
    if (!uri) {
      console.error("MONGO_URI non impostata. Controlla il file .env");
      process.exit(1);
    }

    // si connette a MongoDB con opzioni consigliate
    await mongoose.connect(uri, {
      // opzioni moderne: mongoose 6+ non richiede più useNewUrlParser ecc ma è OK metterle
      // mantenute al default per chiarezza; qui si lasciano oggetti vuoti per mantenere compatibilità.
    });

    // se la connessione va a buon fine, avvisa in console
    console.log("🚀 MongoDB connesso");
  } catch (error) {
    // log dell'errore e chiusura dell'app se la connessione fallisce
    console.error("💥 Errore di connessione a MongoDB:", error.message);
    process.exit(1);
  }
};
