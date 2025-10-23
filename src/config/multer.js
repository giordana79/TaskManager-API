// Configurazione centrale Multer per upload file

import multer from "multer";
import path from "path";
import fs from "fs";

// Directory uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Storage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // cartella
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique); // nome file unico
  },
});

// Filtro file
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo di file non supportato"), false);
};

// Export multer configurato
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
