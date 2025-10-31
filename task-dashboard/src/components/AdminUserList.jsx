import React from "react";

export default function AdminUserList({ users, onDelete }) {
  if (!users.length)
    return <div className="card">Nessun utente registrato.</div>;
  return (
    <div className="user-list">
      {users.map((u) => (
        <div key={u._id} className="card">
          <strong>{u.name || "—"}</strong> <span>({u.email})</span>{" "}
          <span>Role: {u.role}</span>
          <div className="actions" style={{ marginTop: "0.5rem" }}>
            <button className="btn danger" onClick={() => onDelete(u._id)}>
              Elimina
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
