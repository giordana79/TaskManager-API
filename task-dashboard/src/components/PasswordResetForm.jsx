// components/PasswordResetForm.jsx - NUOVO
import React, { useState } from "react";
import { resetPassword } from "../lib/api";

/**
 * Form per resettare password con token
 * URL: /reset-password?token=...
 */
export default function PasswordResetForm({ token, onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validazione password
    if (newPassword.length < 6) {
      setError("La password deve essere almeno 6 caratteri");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, newPassword);
      setMessage(data.message);

      // Redirect al login dopo 2 secondi
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || "Errore durante il reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Nuova Password</h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
        Inserisci la tua nuova password
      </p>

      {message && <div className="info success">{message}</div>}
      {error && <div className="info error">{error}</div>}

      <form onSubmit={submit} className="auth-form">
        <label>
          Nuova Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Minimo 6 caratteri"
          />
        </label>

        <label>
          Conferma Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Ripeti la password"
          />
        </label>

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Salvataggio..." : "Aggiorna password"}
          </button>
        </div>
      </form>
    </div>
  );
}
