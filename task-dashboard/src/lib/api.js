const API_BASE =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "http://localhost:3000/api";

/**
 * Gestione automatica refresh token
 * Se riceve 401, prova a rinnovare access token con refresh token
 */
async function request(
  path,
  { token, method = "GET", body, headers = {}, skipRefresh = false } = {}
) {
  const url = `${API_BASE}${path}`;
  const init = {
    method,
    headers: { ...headers },
  };

  // Usa access token (non più solo "token")
  if (token) init.headers["Authorization"] = `Bearer ${token}`;

  if (body && !(body instanceof FormData)) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    init.body = body;
  }

  const res = await fetch(url, init);

  // Se 401 e abbiamo refresh token, prova a rinnovare
  if (res.status === 401 && !skipRefresh) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        // Chiama endpoint refresh
        const refreshRes = await request("/auth/refresh", {
          method: "POST",
          body: { refreshToken },
          skipRefresh: true, // evita loop infinito
        });

        // Salva nuovo access token
        const newAccessToken = refreshRes.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Riprova la richiesta originale con nuovo token
        return request(path, {
          ...arguments[1],
          token: newAccessToken,
          skipRefresh: true,
        });
      } catch (refreshErr) {
        // Refresh fallito: logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        const err = new Error("Sessione scaduta");
        err.status = 401;
        throw err;
      }
    }

    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.message || "Errore API");
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

/* AUTH  */

export const register = (payload) =>
  request("/auth/register", { method: "POST", body: payload });

export const login = async (payload) => {
  const data = await request("/auth/login", { method: "POST", body: payload });

  // Salva entrambi i token
  if (data.accessToken && data.refreshToken) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  return data;
};

export const logout = async (token) => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    await request("/auth/logout", {
      token,
      method: "POST",
      body: { refreshToken },
    });
  } finally {
    // Rimuovi token anche se chiamata fallisce
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export const getProfile = async (token) => {
  const data = await request("/protected", { token });
  return data.user;
};

// FUNZIONI PASSWORD RESET
export const requestPasswordReset = (email) =>
  request("/auth/request-reset", {
    method: "POST",
    body: { email },
  });

export const resetPassword = (token, newPassword) =>
  request("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });

/* TASKS  */

export const fetchTasks = (token) => request("/tasks", { token });

export const createTask = (token, payload) =>
  request("/tasks", { token, method: "POST", body: payload });

export const patchTask = (token, id, payload) =>
  request(`/tasks/${id}`, { token, method: "PATCH", body: payload });

export const deleteTask = (token, id) =>
  request(`/tasks/${id}`, { token, method: "DELETE" });

export const uploadFileToTask = (token, id, file) => {
  const form = new FormData();
  form.append("file", file);
  return request(`/tasks/${id}/upload`, {
    token,
    method: "POST",
    body: form,
  });
};

export { request };
