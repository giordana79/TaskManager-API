// Joi per schemi di validazione
import Joi from "joi";

// schema per la registrazione: email obbligatoria + password >= 6 + name opzionale
export const registerSchema = Joi.object({
  name: Joi.string().max(100).allow("").optional(), // nome opzionale
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(), // email valida
  password: Joi.string().min(6).required(), // password min 6 caratteri
});

// schema per il login: email + password obbligatorie
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
});
