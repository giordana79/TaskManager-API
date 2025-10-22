import express from "express";
import * as taskController from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import { taskSchema } from "../validation/task.validation.js";

const router = express.Router();

/*
 * Tutte le rotte dei task sono protette da JWT.
 * Si usa `auth` prima di accedere al controller.
 */

// Crea un nuovo task
router.post("/", auth, validate(taskSchema), taskController.createTask);

// Ottiene tutti i task dell’utente
router.get("/", auth, taskController.getTasks);

// Aggiorna un task
router.patch("/:id", auth, validate(taskSchema), taskController.updateTask);

// Elimina un task
router.delete("/:id", auth, taskController.deleteTask);

export default router;
