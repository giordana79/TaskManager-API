//IMPORTANTE: dotenv DEVE essere la prima cosa!
import dotenv from "dotenv";
dotenv.config(); // Carica .env SUBITO

// Ora gli altri import possono leggere process.env
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Config e middleware
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import { requestLogger } from "./middleware/loggerMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/auth.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE GLOBALI
app.use(helmet());

//app.use(
// cors({
//   origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
//})
//);

// Definisci le opzioni CORS
const corsOptions = {
  // Specifica ESATTAMENTE l'URL del tuo frontend su Vercel
  origin: "https://task-manager-api-ecru-kappa.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Se gestisci cookie o sessioni
  optionsSuccessStatus: 204,
};

// Applica il middleware CORS con le opzioni
app.use(cors(corsOptions));

app.use(express.json());
app.use(requestLogger);

// SERVE STATICAMENTE LA CARTELLA UPLOADS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// SWAGGER UI
const swaggerDocument = YAML.load(
  path.join(process.cwd(), "docs", "openapi.yaml")
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// RATE LIMIT
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Troppe richieste, riprova più tardi",
});
app.use("/api/auth", authLimiter);

// ROTTE API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

// Healthcheck
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
  })
);

// Rotta protetta di test
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Sei autenticato!", user: req.user });
});

// ERROR HANDLER (sempre ultimo)
app.use(errorHandler);

// AVVIO SERVER
const start = async () => {
  try {
    await connectDB();

    // Creazione uploads se non esiste
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    app.listen(PORT, () => {
      // In locale mostra localhost, in produzione solo la porta
      const host =
        process.env.NODE_ENV === "development"
          ? `http://localhost:${PORT}`
          : `porta ${PORT}`;
      logger.info(
        `🚀 Server avviato su ${host} (env: ${process.env.NODE_ENV || "development"})`
      );
    });
  } catch (err) {
    logger.error("Errore avvio server: " + err.message);
    process.exit(1);
  }
};

start();
