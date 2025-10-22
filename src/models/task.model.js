import mongoose from "mongoose";

// Definizione dello schema del Task
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // il titolo è obbligatorio
      trim: true, // rimuove spazi in eccesso
    },
    description: {
      type: String,
      default: "", // campo facoltativo
    },
    completed: {
      type: Boolean,
      default: false, // di default un task è "non completato"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // riferimento al modello User
      required: true, // ogni task deve appartenere a un utente
    },
  },
  {
    timestamps: true, // aggiunge createdAt e updatedAt
  }
);

// Esporta il modello
export const Task = mongoose.model("Task", taskSchema);
