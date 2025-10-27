import { request } from "./api";

/* Utenti */
export const fetchAdminUsers = (token) => request("/admin/users", { token });
export const deleteAdminUser = (token, id) =>
  request(`/admin/users/${id}`, { token, method: "DELETE" });

/* Task */
export const fetchAdminTasks = (token) => request("/admin/tasks", { token });
export const deleteAdminTask = (token, id) =>
  request(`/admin/tasks/${id}`, { token, method: "DELETE" });
export const uploadFileToTask = (token, id, file) => {
  const form = new FormData();
  form.append("file", file);
  return request(`/admin/tasks/${id}/upload`, {
    token,
    method: "POST",
    body: form,
  });
};
