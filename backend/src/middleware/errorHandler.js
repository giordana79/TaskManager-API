import logger from "../config/logger.js";

/**
 * Middleware globale per la gestione degli errori
 * - Errori 4xx/5xx loggati come "error" (rosso)
 * - Errori previsti (AppError) restituiscono messaggio chiaro
 * - In sviluppo mostra stack trace
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = `${statusCode}`.startsWith("4") ? "fail" : "error";

  // Log degli errori 4xx e 5xx
  if (statusCode >= 400) {
    logger.error(
      `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`
    );
  } else {
    logger.info(
      `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`
    );
  }

  // Risposta JSON standard
  res.status(statusCode).json({
    status,
    message: err.message || "Errore interno del server",
    // mostra stack solo in sviluppo
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
