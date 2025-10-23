// Entry point server Express
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

import connectDB from "./config/db.js";
import logger from "./config/logger.js";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";

import { requestLogger } from "./middleware/loggerMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/auth.js";

// Swagger UI
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE GLOBALI

// Sicurezza HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" })
);

// Parser JSON
app.use(express.json());

// Logger richieste
app.use(requestLogger);

// SWAGGER UI

// Carica OpenAPI YAML
const swaggerDocument = YAML.load(
  path.join(process.cwd(), "docs", "openapi.yaml")
);

// Servi Swagger UI su /api/docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// RATE LIMIT

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // max 100 richieste
  message: "Troppe richieste, riprova più tardi",
});
app.use("/api/auth", authLimiter);

// ====================
// ROTTE STATICHE
// ====================

// Servire file upload statici
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ROTTE API

// Autenticazione
app.use("/api/auth", authRoutes);

// Task CRUD + upload
app.use("/api/tasks", taskRoutes);

// Healthcheck
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

// Rotta protetta di test
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Sei autenticato!", user: req.user });
});

// ERROR HANDLER

// Deve essere sempre ultimo middleware
app.use(errorHandler);

// AVVIO SERVER

const start = async () => {
  try {
    await connectDB(); // connessione DB

    // Creazione uploads se non esiste
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    app.listen(PORT, () =>
      logger.info(
        `🚀 Server avviato su http://localhost:${PORT} (env: ${process.env.NODE_ENV})`
      )
    );
  } catch (err) {
    logger.error("Errore avvio server: " + err.message);
    process.exit(1);
  }
};

start();
