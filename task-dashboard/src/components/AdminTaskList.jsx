import React from "react";
import TaskItem from "./TaskItem";

export default function AdminTaskList({ tasks, onDelete, onUpload }) {
  if (!tasks.length) return <div className="card">Nessun task presente.</div>;
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onDelete={onDelete}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}
