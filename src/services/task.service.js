import Task from "../models/task.model.js";
import AppError from "../utils/AppError.js";
import logger from "../config/logger.js";

/**
 * Crea un nuovo task per l'utente loggato
 */
export const createTask = async (userId, taskData) => {
  // Crea un nuovo documento Task, aggiungendo l'owner
  const task = new Task({
    ...taskData,
    owner: userId,
  });

  // Salva nel database
  await task.save();

  // Log informativo per auditing
  logger.info(`Task creato ${task._id} da utente ${userId}`);

  // Restituisce il task appena creato
  return task;
};

/**
 * Ottiene tutti i task dell’utente loggato
 */
export const getTasksByUser = async (userId) => {
  // Recupera tutti i task dell’utente, ordinati per data di creazione (più recenti prima)
  const tasks = await Task.find({ owner: userId }).sort({ createdAt: -1 });
  return tasks;
};

/**
 * Aggiorna un task (solo se appartiene all’utente)
 */
export const updateTask = async (userId, taskId, updateData) => {
  // Cerca il task nel DB
  const task = await Task.findById(taskId);

  // Se non esiste → 404
  if (!task) throw new AppError("Task non trovato", 404);

  // Se esiste ma non appartiene all’utente → 403
  if (task.owner.toString() !== userId) {
    throw new AppError("Non sei autorizzato ad aggiornare questo task", 403);
  }

  // Aggiorna i campi e salva
  Object.assign(task, updateData);
  await task.save();

  logger.info(`Task aggiornato ${task._id} da utente ${userId}`);
  return task;
};

/**
 * Elimina un task (solo se appartiene all’utente)
 */
export const deleteTask = async (userId, taskId) => {
  const task = await Task.findById(taskId);

  // Se non esiste → 404
  if (!task) throw new AppError("Task non trovato", 404);

  // Se non appartiene all’utente → 403
  if (task.owner.toString() !== userId) {
    throw new AppError("Non sei autorizzato a eliminare questo task", 403);
  }

  await task.deleteOne();
  logger.info(`Task eliminato ${task._id} da utente ${userId}`);
  return task;
};

/**
 * Carica un file associato a un task (solo se appartiene all’utente)
 */
export const uploadFileToTask = async (userId, taskId, filename) => {
  const task = await Task.findById(taskId);

  // Se non esiste → 404
  if (!task) {
    logger.warn(`Tentativo di upload su task inesistente: ${taskId}`);
    throw new AppError("Task non trovato", 404);
  }

  // Se esiste ma appartiene ad altro utente → 403
  if (task.owner.toString() !== userId) {
    logger.warn(
      `Utente ${userId} ha tentato upload su task ${taskId} di ${task.owner}`
    );
    throw new AppError("Non sei autorizzato ad aggiornare questo task", 403);
  }

  // Se esiste già un file → cancella
  if (task.file) {
    const fs = await import("fs");
    const path = await import("path");
    const oldPath = path.join(process.cwd(), "uploads", task.file);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Assegna e salva il nuovo file
  task.file = filename;
  await task.save();

  logger.info(
    `File ${filename} caricato per task ${task._id} da utente ${userId}`
  );
  return task;
};
