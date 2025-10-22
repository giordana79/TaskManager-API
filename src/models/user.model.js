// import mongoose per definire lo schema e bcryptjs per hash password
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// crea lo schema User con campi base: name, email, password e timestamps
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // nome utente (opzionale/obbligatorio a scelta)
      trim: true, // rimuove spazi iniziali/finali
      default: "", // valore di default vuoto
    },
    email: {
      type: String, // email utente
      required: true, // campo obbligatorio
      unique: true, // valore unico nella collezione
      lowercase: true, // memorizza in minuscolo
      trim: true, // rimuove spazi in eccesso
    },
    password: {
      type: String, // password hashata
      required: true, // obbligatoria (al momento della registrazione)
    },
  },
  {
    timestamps: true, // aggiunge createdAt e updatedAt
  }
);

/*
 * Pre-save hook: prima di salvare un documento user su 'save',
 * se la password è stata modificata la si hashia con bcrypt.
 * Si usa function(){} per avere accesso a `this`.
 */
userSchema.pre("save", async function (next) {
  // `this` è il documento user
  const user = this;

  // se la password non è stata modificata, prosegue senza re-hash
  if (!user.isModified("password")) return next();

  try {
    // genera un salt e poi hasha la password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/*
 * Metodo istanza per verificare password in fase di login.
 * Restituisce true se la password in chiaro corrisponde all'hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// esporta il modello Mongoose 'User'
export const User = mongoose.model("User", userSchema);
