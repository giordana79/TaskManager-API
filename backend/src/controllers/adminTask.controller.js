import Task from "../models/task.model.js";
import AppError from "../utils/AppError.js";
import fs from "fs";
import path from "path";

// Visualizza tutti i task con owner
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate("owner", "email role");
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// Modifica qualsiasi task
export const updateTaskAdmin = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("owner", "email role");
    if (!task) throw new AppError("Task non trovato", 404);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Elimina qualsiasi task e file associato
export const deleteTaskAdmin = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw new AppError("Task non trovato", 404);

    if (task.file) {
      const filepath = path.join(process.cwd(), "uploads", task.file);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    res.json({ success: true, message: "Task eliminato" });
  } catch (err) {
    next(err);
  }
};

// Upload file su qualsiasi task
export const uploadFileAdmin = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Nessun file fornito", 400);

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { file: req.file.filename },
      { new: true }
    ).populate("owner", "email role");

    if (!task) throw new AppError("Task non trovato", 404);

    res.json(task);
  } catch (err) {
    next(err);
  }
};
