import express from "express";
import authMiddleware from "../middleware/auth.js";
import * as taskController from "../controllers/task.controller.js";
import { upload } from "../config/multer.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";

const router = express.Router();

router.use(authMiddleware);

// CRUD
router.get("/", taskController.getTasks);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Upload file
//router.post("/:id/upload", upload.single("file"), taskController.uploadFile);
router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("file"),
  taskController.uploadFile
);

export default router;
