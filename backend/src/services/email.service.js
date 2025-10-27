// VERSIONE CON DEBUG
import nodemailer from "nodemailer";
import logger from "../config/logger.js";

/**
 * Crea transporter Nodemailer con logging debug
 */
const createTransporter = () => {
  // Log variabili ambiente per debug
  logger.info("🔍 Configurazione Email Service:");
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`MAILTRAP_HOST: ${process.env.MAILTRAP_HOST || "NON IMPOSTATO"}`);
  logger.info(`MAILTRAP_PORT: ${process.env.MAILTRAP_PORT || "NON IMPOSTATO"}`);
  logger.info(
    `MAILTRAP_USER: ${process.env.MAILTRAP_USER ? "✅ IMPOSTATO" : "❌ MANCANTE"}`
  );
  logger.info(
    `MAILTRAP_PASS: ${process.env.MAILTRAP_PASS ? "✅ IMPOSTATO" : "❌ MANCANTE"}`
  );
  logger.info(
    `SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? "✅ IMPOSTATO" : "❌ NON IMPOSTATO"}`
  );
  logger.info(`GMAIL_USER: ${process.env.GMAIL_USER || "NON IMPOSTATO"}`);

  // OPZIONE 1: Mailtrap (development/testing)
  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    logger.info("✅ Usando MAILTRAP");
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
      port: parseInt(process.env.MAILTRAP_PORT) || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  logger.error("❌ Nessuna configurazione email trovata nel .env");
  throw new Error("Nessuna configurazione email trovata nel .env");
};

// LAZY LOADING: crea transporter solo quando serve
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    try {
      transporter = createTransporter();
      logger.info("✅ Email transporter creato con successo");
    } catch (err) {
      logger.error("❌ Errore creazione transporter: " + err.message);
      throw err;
    }
  }
  return transporter;
};

/**
 * Invia email di reset password
 */
export const sendPasswordResetEmail = async (to, resetToken) => {
  const transport = getTransporter(); // ← Crea solo ora!

  const resetUrl = `${
    process.env.FRONTEND_ORIGIN || "http://localhost:5173"
  }/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@taskapp.com",
    to,
    subject: "Reset Password - Task Dashboard",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset della Password</h2>
        <p>Hai richiesto il reset della tua password.</p>
        <p>Clicca sul pulsante qui sotto per reimpostare la password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Oppure copia e incolla questo link nel browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Questo link scade tra 1 ora.<br>
          Se non hai richiesto il reset, ignora questa email.
        </p>
      </div>
    `,
    text: `
      Reset della Password
      
      Hai richiesto il reset della tua password.
      Clicca sul link qui sotto per reimpostare la password:
      
      ${resetUrl}
      
      Questo link scade tra 1 ora.
      Se non hai richiesto il reset, ignora questa email.
    `,
  };

  try {
    logger.info(`📧 Tentativo invio email a ${to}...`);
    const info = await transport.sendMail(mailOptions); // ← Usa transport
    logger.info(`✅ Email reset password inviata a ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Errore invio email a ${to}:`);
    logger.error(`   Messaggio: ${error.message}`);
    logger.error(`   Stack: ${error.stack}`);
    throw new Error("Impossibile inviare email di reset");
  }
};

/**
 * Invia email di benvenuto (opzionale)
 */
export const sendWelcomeEmail = async (to, name) => {
  let transport;
  try {
    transport = getTransporter();
  } catch (err) {
    logger.warn("Email service non configurato, skip welcome email");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@taskapp.com",
    to,
    subject: "Benvenuto su Task Dashboard",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Benvenuto ${name}!</h2>
        <p>Grazie per esserti registrato alla Task Dashboard.</p>
        <p>Ora puoi iniziare a gestire i tuoi task in modo efficiente!</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Vai alla Dashboard
          </a>
        </div>
      </div>
    `,
  };

  try {
    await transport.sendMail(mailOptions); // ← Usa transport
    logger.info(`✅ Email benvenuto inviata a ${to}`);
  } catch (error) {
    logger.error(`❌ Errore invio welcome email: ${error.message}`);
  }
};
