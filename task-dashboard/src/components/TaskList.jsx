import React from "react";
import TaskItem from "./TaskItem";

/**
 * TaskList: elenca TaskItem
 */
export default function TaskList({ tasks, onDelete, onUpload, setMessage }) {
  if (!tasks.length) return <div className="card">Nessun task presente.</div>;

  return (
    <div className="task-list">
      {tasks.map((t) => (
        <TaskItem
          key={t._id}
          task={t}
          onDelete={onDelete}
          onUpload={onUpload}
          setMessage={setMessage}
        />
      ))}
    </div>
  );
}
