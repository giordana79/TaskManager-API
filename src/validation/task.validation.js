import Joi from "joi";

// Schema di validazione per creazione/aggiornamento task
export const taskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(), // titolo obbligatorio
  description: Joi.string().allow("").optional(), // descrizione facoltativa
  completed: Joi.boolean().optional(), // può essere true o false
});
