import React, { useState } from "react";
import { requestPasswordReset } from "../lib/api";

/**
 * Form per richiedere reset password
 * Invia email con link di reset
 */
export default function PasswordResetRequest({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Errore durante la richiesta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Reset Password</h2>
      <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
        Inserisci la tua email per ricevere le istruzioni di reset
      </p>

      {message && <div className="info success">{message}</div>}
      {error && <div className="info error">{error}</div>}

      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tua-email@example.com"
          />
        </label>

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Invio..." : "Invia link reset"}
          </button>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <a href="/" style={{ fontSize: "0.9rem", color: "var(--primary)" }}>
            ← Torna al login
          </a>
        </div>
      </form>
    </div>
  );
}
