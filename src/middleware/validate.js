/*
 * Middleware generico per validare il body della richiesta con Joi.
 * Usage: app.post('/x', validate(schema), controller)
 */

// riceve uno schema Joi e ritorna il middleware
export const validate = (schema) => (req, res, next) => {
  // validate il corpo della richiesta con abortEarly: false per raccogliere tutti gli errori
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  // se c'è un errore, risponde 400 con dettagli
  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(400).json({ error: "ValidationError", details });
  }

  // sostituise req.body con la versione 'pulita' restituita da Joi (stripUnknown)
  req.body = value;
  return next();
};
