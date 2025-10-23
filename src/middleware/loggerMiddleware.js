// Middleware per loggare ogni richiesta HTTP
//loggin avanzato con Winston traamite il middleware requestLogger

import logger from "../config/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};
