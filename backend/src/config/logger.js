// Configurazione Winston unificata

import winston from "winston";
import fs from "fs";
import path from "path";

// creazione cartella logs se non esiste
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Definizione livelli log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colori per console
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};
winston.addColors(colors);

// Formato log
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}] ${info.message}`
  )
);

// Trasporti log
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(logDir, "combined.log"),
  }),
];

// Istanza logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports,
});

export default logger;
