// Modello Task

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file: { type: String, default: null }, // nome file salvato in uploads/
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
