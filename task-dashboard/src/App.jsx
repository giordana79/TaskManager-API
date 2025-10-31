import React, { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordResetForm from "./components/PasswordResetForm";
import { getProfile, logout } from "./lib/api";
import "./styles.css";

export default function App() {
  // Usa accessToken invece di token
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [message, setMessage] = useState(null);

  // Applica tema
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Valida access token all'avvio
  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        setUser(null);
        return;
      }

      setLoadingUser(true);
      try {
        const profile = await getProfile(accessToken);
        setUser(profile);
      } catch (err) {
        // Token non valido: pulisci storage
        setMessage("Sessione scaduta. Effettua nuovamente il login.");
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    init();
  }, [accessToken]);

  // Salva access token dopo login
  const handleSignIn = (newAccessToken, userProfile) => {
    // accessToken e refreshToken già salvati in localStorage da api.js
    setAccessToken(newAccessToken);
    setUser(userProfile || null);
    setMessage(null);
  };

  // Logout con revoca refresh token
  const handleLogout = async () => {
    try {
      await logout(accessToken);
    } catch (err) {
      console.error("Errore logout:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  // Routing semplice basato su path
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

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
          {user && (
            <div className="user-block">
              <span className="user-email">{user.email}</span>
              {user.role === "admin" && (
                <a
                  href="/admin"
                  className="btn"
                  style={{ marginLeft: "0.5rem" }}
                >
                  Admin
                </a>
              )}
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {message && <div className="info error">{message}</div>}

        {/* Rotta reset password */}
        {path === "/reset-password" && searchParams.get("token") ? (
          <PasswordResetForm
            token={searchParams.get("token")}
            onSuccess={() => {
              setMessage("Password aggiornata! Effettua il login.");
              window.location.href = "/";
            }}
          />
        ) : path === "/forgot-password" ? (
          <PasswordResetRequest
            onSuccess={() =>
              setMessage("Controlla la tua email per le istruzioni")
            }
          />
        ) : path === "/admin" && user?.role === "admin" ? (
          <AdminDashboard
            token={accessToken}
            onUnauthenticated={() => {
              setMessage("Sessione scaduta, effettua il login.");
              handleLogout();
            }}
          />
        ) : !accessToken ? (
          <AuthForm onSignIn={handleSignIn} setMessage={setMessage} />
        ) : loadingUser ? (
          <div>Caricamento profilo...</div>
        ) : user?.role === "admin" ? (
          <AdminDashboard
            token={accessToken}
            onUnauthenticated={() => {
              setMessage("Sessione scaduta, effettua il login.");
              handleLogout();
            }}
          />
        ) : (
          <Dashboard
            token={accessToken}
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
