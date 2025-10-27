// Punto base: modifica se la tua API è su un domain differente.
// In deploy su Render/ Railway imposta REACT_APP_API_URL in .env (Vite usa import.meta.env)
const API_BASE =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "http://localhost:3000/api";

/**
 * helper fetch che include Authorization header se token presente
 * ritorna json o lancia errore
 */
async function request(
  path,
  { token, method = "GET", body, headers = {} } = {}
) {
  const url = `${API_BASE}${path}`;
  const init = {
    method,
    headers: {
      ...headers,
    },
  };

  if (token) init.headers["Authorization"] = `Bearer ${token}`;

  if (body && !(body instanceof FormData)) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    init.body = body; // browser setta multipart boundary
  }

  const res = await fetch(url, init);

  if (res.status === 401) {
    // autenticazione fallita
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

/* Auth */
export const register = (payload) =>
  request("/auth/register", { method: "POST", body: payload });
export const login = (payload) =>
  request("/auth/login", { method: "POST", body: payload });
export const getProfile = (token) => request("/protected", { token }); // se non hai /auth/me, usa /api/protected o implementa endpoint

/* Tasks */
export const fetchTasks = (token) => request("/tasks", { token });
export const createTask = (token, payload) =>
  request("/tasks", { token, method: "POST", body: payload });
export const patchTask = (token, id, payload) =>
  request(`/tasks/${id}`, { token, method: "PATCH", body: payload });
export const deleteTask = (token, id) =>
  request(`/tasks/${id}`, { token, method: "DELETE" });

/* Upload file (multipart/form-data) */
export const uploadFileToTask = (token, id, file) => {
  const form = new FormData();
  form.append("file", file);
  return request(`/tasks/${id}/upload`, { token, method: "POST", body: form });
};
