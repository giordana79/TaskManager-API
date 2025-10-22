import * as taskService from "../services/task.service.js";

// POST /api/tasks → crea nuovo task
export const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id; // recupera id utente dal token
    const task = await taskService.createTask(userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks → lista task dell’utente loggato
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getTasksByUser(userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id → aggiorna un task
export const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const updated = await taskService.updateTask(userId, taskId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id → elimina un task
export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    await taskService.deleteTask(userId, taskId);
    res.json({ message: "Task eliminato con successo" });
  } catch (err) {
    next(err);
  }
};
