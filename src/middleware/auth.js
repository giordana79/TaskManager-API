// middleware per proteggere rotte tramite JWT
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/*
 * Auth middleware:
 * - legge header Authorization: Bearer <token>
 * - verifica il token usando JWT_SECRET
 * - attacca req.user = { id, email } (recuperati dal payload)
 * - opzionalmente puoi caricare l'intero user dal DB e attaccarlo a req.userDoc
 */

export const auth = async (req, res, next) => {
  try {
    // prende header Authorization
    const authHeader = req.headers.authorization;

    // se non c'è header, ritorna 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          error: "Unauthorized",
          message: "Token mancante o formato non valido",
        });
    }

    // estrae il token dopo "Bearer "
    const token = authHeader.split(" ")[1];

    // se manca JWT_SECRET lancia un errore (configurazione)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET non impostato in .env");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // verifica token (decodifica)
    const payload = jwt.verify(token, secret);

    // payload dovrebbe contenere userId e email
    // attacca informazioni essenziali a req.user così i controller possono usarle
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    /*
     * Optional: si può recuperare il documento user dal DB se  servono campi aggiuntivi:
     * req.userDoc = await User.findById(payload.userId).select('-password');
     */

    return next();
  } catch (err) {
    // gestisce errori di token scaduto o non valido
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Token scaduto" });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Token non valido" });
    }

    // per qualsiasi altro errore, logga e ritorna 500
    console.error("Errore auth middleware:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
