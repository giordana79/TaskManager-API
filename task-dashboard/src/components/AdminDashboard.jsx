import React, { useEffect, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminTasks,
  deleteAdminUser,
  deleteAdminTask,
  uploadFileToTask,
} from "../lib/adminApi";
import AdminUserList from "./AdminUserList";
import AdminTaskList from "./AdminTaskList";

export default function AdminDashboard({ token, onUnauthenticated }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, t] = await Promise.all([
          fetchAdminUsers(token),
          fetchAdminTasks(token),
        ]);
        setUsers(u);
        setTasks(t);
      } catch (err) {
        if (err.status === 401) onUnauthenticated();
        else setMessage(err.message || "Errore caricamento dati admin");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleDeleteUser = async (id) => {
    if (!confirm("Eliminare utente?")) return;
    try {
      await deleteAdminUser(token, id);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore eliminazione utente");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Eliminare task?")) return;
    try {
      await deleteAdminTask(token, id);
      setTasks((t) => t.filter((x) => x._id !== id));
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore eliminazione task");
    }
  };

  const handleUpload = async (id, file) => {
    try {
      const updatedTask = await uploadFileToTask(token, id, file);
      setTasks((tasks) =>
        tasks.map((t) => (t._id === id ? { ...t, ...updatedTask } : t))
      );
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore upload file");
    }
  };

  return (
    <div className="dashboard">
      {message && <div className="info error">{message}</div>}
      {loading ? (
        <div>Caricamento dati admin...</div>
      ) : (
        <>
          <h2>Gestione Utenti</h2>
          <AdminUserList users={users} onDelete={handleDeleteUser} />

          <h2>Gestione Task</h2>
          <AdminTaskList
            tasks={tasks}
            onDelete={handleDeleteTask}
            onUpload={handleUpload}
          />
        </>
      )}
    </div>
  );
}
