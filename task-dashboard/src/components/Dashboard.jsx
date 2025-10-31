import React, { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  deleteTask,
  uploadFileToTask,
} from "../lib/api";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

/**
 * Dashboard: gestisce caricamento/creazione/cancellazione/upload dei task
 * - token viene passato come prop
 * - onUnauthenticated viene chiamata se riceviamo 401 per notificare App
 */
export default function Dashboard({ token, onUnauthenticated }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [message, setMessage] = useState(null);

  // carica task all'avvio
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTasks(token);
        if (mounted) {
          setTasks(data);
        }
      } catch (err) {
        if (err.status === 401) onUnauthenticated();
        else setMessage(err.message || "Errore caricamento task");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [token]);

  const handleCreate = async (payload) => {
    try {
      const created = await createTask(token, payload);
      setTasks((t) => [created, ...t]);
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore creazione task");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare task?")) return;
    try {
      await deleteTask(token, id);
      setTasks((t) => t.filter((x) => x._id !== id));
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore eliminazione task");
    }
  };

  const handleUpload = async (id, file) => {
    try {
      const updatedFile = await uploadFileToTask(token, id, file);
      setTasks((tasks) =>
        tasks.map((task) =>
          task._id === id ? { ...task, ...updatedFile } : task
        )
      );
    } catch (err) {
      if (err.status === 401) onUnauthenticated();
      else setMessage(err.message || "Errore upload file");
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "completed") return t.completed;
    return !t.completed;
  });

  return (
    <div className="dashboard">
      {message && <div className="info error">{message}</div>}

      <div className="panel">
        <TaskForm onCreate={handleCreate} />
        <div className="filters">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tutti</option>
            <option value="active">In corso</option>
            <option value="completed">Completati</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Caricamento task...</div>
      ) : (
        <TaskList
          tasks={filtered}
          onDelete={handleDelete}
          onUpload={handleUpload}
          setMessage={setMessage}
        />
      )}
    </div>
  );
}
