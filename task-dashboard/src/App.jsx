import React, { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import { getProfile } from "./lib/api";
import "./styles.css";

/**
 * App - gestisce autenticazione globale e tema (dark/light)
 * - conserva token in localStorage
 * - quando token è presente prova a ottenere profilo per validarlo
 */
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [message, setMessage] = useState(null);

  // applica classe tema al body
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // quando token cambia, prova a validarlo ottenendo profilo
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      setLoadingUser(true);
      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (err) {
        // token non valido o scaduto: rimuovilo e mostra messaggio
        setMessage("Token non valido o scaduto. Effettua nuovamente il login.");
        setToken(null);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    init();
  }, [token]);

  // signinHandler: salvare token da login/registrazione
  const handleSignIn = (newToken, userProfile) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userProfile || null);
    setMessage(null);
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Dashboard</h1>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            title="Toggle dark/light"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {user ? (
            <div className="user-block">
              <span className="user-email">{user.email}</span>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        {message && <div className="info error">{message}</div>}

        {!token ? (
          <AuthForm onSignIn={handleSignIn} setMessage={setMessage} />
        ) : loadingUser ? (
          <div>Caricamento profilo...</div>
        ) : (
          <Dashboard
            token={token}
            onUnauthenticated={() => {
              setMessage("Sessione scaduta, effettua il login.");
              handleLogout();
            }}
          />
        )}
      </main>

      <footer className="app-footer">
        <small>© 2025 Task Dashboard</small>
      </footer>
    </div>
  );
}
