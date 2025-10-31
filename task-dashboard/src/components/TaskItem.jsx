import React, { useRef, useState } from "react";

export default function TaskItem({ task, onDelete, onUpload }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadedUrl = task.file
    ? `${import.meta.env.VITE_STATIC_BASE || "http://localhost:3000"}/uploads/${task.file}`
    : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
    doUpload(file);
  };

  const doUpload = async (file) => {
    setUploading(true);
    try {
      await onUpload(task._id, file);
    } finally {
      setUploading(false);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="card task-item">
      <div className="task-main">
        <div>
          <strong>{task.title}</strong>
          <div className="muted">{task.description}</div>
        </div>
        <div className="task-actions">
          <button className="btn danger" onClick={() => onDelete(task._id)}>
            Elimina
          </button>
        </div>
      </div>

      <div className="task-meta">
        <small>
          Creato:{" "}
          {task.createdAt
            ? new Date(task.createdAt).toLocaleString()
            : "Appena aggiornato"}
        </small>
        <small>Stato: {task.completed ? "Completato" : "In corso"}</small>
      </div>

      <div className="upload-block">
        <input ref={fileRef} type="file" onChange={handleFileChange} />
        {uploading && <div>Upload in corso...</div>}
        {preview && (
          <div className="preview">
            <img src={preview} alt="preview" />
          </div>
        )}
        {!preview && uploadedUrl && (
          <div className="preview">
            <a href={uploadedUrl} target="_blank" rel="noreferrer">
              <img src={uploadedUrl} alt="uploaded" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
