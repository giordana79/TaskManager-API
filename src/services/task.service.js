/*
 * Qui c'è la logica principale di interazione col DB.
 
 */

import { Task } from "../models/task.model.js";

// Crea un nuovo task per l'utente loggato
export const createTask = async (userId, taskData) => {
  const task = new Task({
    ...taskData, // title, description, completed
    owner: userId, // collega all'utente autenticato
  });
  await task.save();
  return task;
};

// Ottiene tutti i task dell’utente loggato
export const getTasksByUser = async (userId) => {
  return Task.find({ owner: userId }).sort({ createdAt: -1 });
};

// Aggiorna un task (solo se appartiene all’utente)
export const updateTask = async (userId, taskId, updateData) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: userId }, // trova solo task dell'utente
    updateData,
    { new: true, runValidators: true } // ritorna il nuovo documento aggiornato
  );

  if (!task) {
    const err = new Error("Task non trovato o non autorizzato");
    err.status = 404;
    throw err;
  }

  return task;
};

// Elimina un task (solo se appartiene all’utente)
export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: userId });
  if (!task) {
    const err = new Error("Task non trovato o non autorizzato");
    err.status = 404;
    throw err;
  }
  return task;
};
