import multer from "multer";
import path from "path";

// Configurazione storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // indica la cartella dove salvare i file
    cb(null, "uploads"); // <-- stringa, non variabile
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`); // mantiene estensione originale
  },
});

// Filtra solo immagini (opzionale)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo immagini consentite"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
