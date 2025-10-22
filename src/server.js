// import delle dipendenze principali
import express from "express"; // framework web
import dotenv from "dotenv"; // carica variabili ambiente da .env
import helmet from "helmet"; // sicurezza headers
import rateLimit from "express-rate-limit"; // rate limiting
import cors from "cors"; // gestione CORS
import morgan from "morgan"; // logging HTTP
import path from "path"; // utilità path
import { fileURLToPath } from "url"; // utilità per __dirname con ES modules
import { connectDB } from "./config/db.js"; // funzione di connessione DB
import { logger, stream } from "./utils/logger.js"; // logger/winston + stream per morgan

// carica le variabili d'ambiente dal file .env nella root
dotenv.config(); // legge .env e popola process.env

// risolvo __dirname per ES modules (non esiste nativamente)
const __filename = fileURLToPath(import.meta.url); // file corrente
const __dirname = path.dirname(__filename); // directory corrente

// funzione asincrona per inizializzare tutto e avviare il server
const startServer = async () => {
  // si connette a MongoDB (legge process.env.MONGO_URI dentro connectDB)
  await connectDB(); // stabilisce la connessione DB

  // creo l'app Express
  const app = express(); // istanza express

  // middleware per parse del JSON nel body delle richieste
  app.use(express.json()); // abilita JSON body parsing

  // middleware per sicurezza: imposta vari header HTTP utili
  app.use(helmet()); // migliora sicurezza headers

  // configurazione CORS: permette richieste solo dall'origine specificata
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  app.use(cors({ origin: allowedOrigin })); // abilita CORS con origine limitata

  // logging delle richieste HTTP con morgan; scrive su winston tramite stream
  app.use(morgan("combined", { stream })); // formato 'combined' con stream custom

  // serve la cartella uploads come static (accessibile via /uploads/...)
  app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve file uploadati

  // rate limiter specifico per le rotte auth (esempio: 100 req / 15 min)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100, // massimo 100 richieste per finestra
    standardHeaders: true, // RFC rate-limit headers
    legacyHeaders: false, // disabilita X-RateLimit-* headers
  });
  app.use("/api/auth", authLimiter); // applica limiter solo a /api/auth

  // endpoint di health check per verificare che l'app sia attiva
  app.get("/api/health", (req, res) => {
    // risponde con uno status 200 e JSON semplice
    res
      .status(200)
      .json({ status: "ok", env: process.env.NODE_ENV || "development" });
  });

  // esempio: route placeholder per future rotte (auth/tasks)
  // app.use('/api/auth', authRoutes);
  // app.use('/api/tasks', taskRoutes);

  // middleware centralizzato per gestione errori generici (fallback)
  // qui si mostra solo una implementazione minima che logga tramite winston
  app.use((err, req, res, next) => {
    // log errore
    logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);
    // risponde con status 500 e messaggio generico
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  });

  // avvio del server sulla porta specificata da env o 3000
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(
      `🚀 Server avviato su http://localhost:${PORT} (env: ${process.env.NODE_ENV})`
    );
  });
};

// avvia il server e gestisce eventuali errori di avvio
startServer().catch((err) => {
  // se startServer fallisce loggalo e termina il processo
  console.error("Errore avvio server:", err);
  process.exit(1);
});
