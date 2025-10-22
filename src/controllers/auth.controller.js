/*
 * Controller Express per le rotte auth.
 * Riceve req/res e richiama il service; si occupa solo di orchestrazione.
 */

import * as authService from "../services/auth.service.js";

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    // i dati sono già 'clean' grazie al middleware validate
    const { name, email, password } = req.body;

    // chiama il service per creare l'utente
    const createdUser = await authService.registerUser({
      name,
      email,
      password,
    });

    // risponde 201 created con l'utente (nota: non include la password)
    return res.status(201).json({ user: createdUser });
  } catch (err) {
    // se il service ha impostato err.status, si usa; altrimenti fallback 500
    return next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    // dati 'clean' dal validate
    const { email, password } = req.body;

    // chiama il service per autenticare e ottenere token
    const { user, token } = await authService.loginUser({ email, password });

    // risponde con user + token
    return res.status(200).json({ user, token });
  } catch (err) {
    return next(err);
  }
};
