import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Schema utente con campi per password reset
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // NUOVI CAMPI PER PASSWORD RESET
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    // NUOVO CAMPO PER REFRESH TOKEN
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Pre-save: hash password solo se modificata
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo per comparare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Metodo per generare reset token
userSchema.methods.createPasswordResetToken = function () {
  // Genera token random di 32 bytes in hex
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash del token da salvare nel DB (per sicurezza)
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Scadenza: 1 ora da ora
  this.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1h

  // Ritorna token in chiaro (da inviare via email)
  return resetToken;
};

// Metodo per verificare reset token
userSchema.methods.verifyResetToken = function (token) {
  // Hash del token ricevuto
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Verifica che corrisponda e non sia scaduto
  return this.resetToken === hashedToken && this.resetTokenExpiry > Date.now();
};

// Metodo per pulire token scaduti
userSchema.methods.cleanupExpiredRefreshTokens = function () {
  const now = Date.now();
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.expiresAt > now);
};

export default mongoose.model("User", userSchema);
