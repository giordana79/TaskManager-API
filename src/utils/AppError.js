// Classe per errori applicativi (operational errors)

export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode; // codice HTTP
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // distinguere errori gestiti da bug

    Error.captureStackTrace(this, this.constructor);
  }
}
