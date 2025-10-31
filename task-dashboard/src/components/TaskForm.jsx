import React, { useState } from "react";

/**
 * TaskForm: semplice form per creare un task
 */
export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onCreate({ title, description });
    setTitle("");
    setDescription("");
    setLoading(false);
  };

  return (
    <form className="card task-form" onSubmit={submit}>
      <h3>Nuovo task</h3>
      <label>
        Titolo
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </label>
      <label>
        Descrizione (opzionale)
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="actions">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "..." : "Crea"}
        </button>
      </div>
    </form>
  );
}
