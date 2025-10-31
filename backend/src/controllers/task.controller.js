import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import * as taskService from "../services/task.service.js";
import fs from "fs";
import path from "path";
import { uploadFileToTask } from "../services/task.service.js";

// GET /tasks
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByUser(req.user.id);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// POST /tasks
export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    logger.info(`Task creato ${task._id} da ${req.user.id}`);
    // Risposta al client
    res.status(201).json(task);
  } catch (err) {
    // Passa l’errore al middleware globale
    next(err);
  }
};

// PATCH /tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.user.id,
      req.params.id,
      req.body
    );
    logger.info(`Task aggiornato ${task._id} da ${req.user.id}`);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await taskService.deleteTask(req.user.id, req.params.id);

    // rimuovo file associato
    if (task.file) {
      const filepath = path.join(process.cwd(), "uploads", task.file);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    logger.info(`Task eliminato ${task._id} da ${req.user.id}`);
    res.json({ success: true, message: "Task eliminato" });
  } catch (err) {
    next(err);
  }
};

// POST /tasks/:id/upload
export const uploadFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) {
      throw new AppError("Nessun file fornito per l'upload", 400);
    }

    const task = await uploadFileToTask(userId, id, req.file.filename);

    res.status(200).json({
      success: true,
      message: "File caricato con successo",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
