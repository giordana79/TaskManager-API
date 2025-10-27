import express from "express";
import authMiddleware from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import user from "../models/user.model.js";
import task from "../models/task.model.js";
import multer from "multer";
import * as adminTaskController from "../controllers/adminTask.controller.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Tutte le rotte sotto auth + admin
router.use(authMiddleware, isAdmin);

// GET tutti gli utenti
router.get("/users", async (req, res) => {
  const users = await user.find().select("-password");
  res.json(users);
});

// GET tutti i task
router.get("/tasks", async (req, res) => {
  const tasks = await task.find().populate("owner", "email name role");
  res.json(tasks);
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Non permettere di cancellare se l'utente non esiste
    const targetUser = await user.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    await targetUser.deleteOne();
    res.json({ success: true, message: "Utente eliminato" });
  } catch (err) {
    next(err);
  }
});

// Admin task routes
router.get("/tasks", adminTaskController.getAllTasks);
router.patch("/tasks/:id", adminTaskController.updateTaskAdmin);
router.delete("/tasks/:id", adminTaskController.deleteTaskAdmin);

// Upload file su qualsiasi task
router.post(
  "/tasks/:id/upload",
  upload.single("file"),
  adminTaskController.uploadFileAdmin
);

export default router;
