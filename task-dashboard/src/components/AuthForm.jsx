import React, { useState } from "react";
import { login, register } from "../lib/api";

export default function AuthForm({ onSignIn, setMessage }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const change = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        const data = await login({
          email: form.email,
          password: form.password,
        });
        // Passa accessToken (non token)
        onSignIn(data.accessToken, data.user);
      } else {
        // Register poi auto-login
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        const data = await login({
          email: form.email,
          password: form.password,
        });
        onSignIn(data.accessToken, data.user);
      }
      setMessage(null);
    } catch (err) {
      if (err.status === 401) setMessage("Credenziali non valide.");
      else setMessage(err.message || "Errore durante autenticazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <div className="tabs">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} className="auth-form">
        {tab === "register" && (
          <label>
            Nome
            <input
              name="name"
              value={form.name}
              onChange={change}
              required
              minLength={2}
            />
          </label>
        )}

        <label>
          Email
          <input
            name="email"
            value={form.email}
            onChange={change}
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            value={form.password}
            onChange={change}
            type="password"
            required
            minLength={6}
          />
        </label>

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "..." : tab === "login" ? "Accedi" : "Registrati"}
          </button>
        </div>

        {/* Link per password dimenticata */}
        {tab === "login" && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <a
              href="/forgot-password"
              style={{ fontSize: "0.9rem", color: "var(--primary)" }}
            >
              Password dimenticata?
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
