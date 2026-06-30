import { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import ConfirmModal from '../ui/ConfirmModal';
import { PlusIcon } from '../ui/Icons';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', className: 'kanban-col-todo' },
  { key: 'IN_PROGRESS', label: 'In Progress', className: 'kanban-col-progress' },
  { key: 'DONE', label: 'Done', className: 'kanban-col-done' },
];

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('TODO');

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const data = await taskService.getByProject(projectId);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (payload) => {
    const newTask = await taskService.create(projectId, payload);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = async (payload) => {
    const updated = await taskService.update(projectId, editingTask.id, payload);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    await taskService.delete(projectId, deletingTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    setDeletingTask(null);
  };

  const handleStatusChange = async (task, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => 
        (t.id === task.id 
          ? { ...t, status: newStatus } 
          : t))
    );
    try {
    const updatedTask = await taskService.updateStatus(
      projectId,
      task.id,
      newStatus
    );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === updatedTask.id
          ? updatedTask
          : t
      )
    );
  } catch (err) {
    // Revert
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: task.status }
          : t
      )
    );
  }
  };

  const openCreateModal = (status = 'TODO') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner" />
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className={`kanban-column ${col.className}`}>
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">
                {col.label}
                <span className="kanban-count">{columnTasks.length}</span>
              </h3>
              <button
                className="kanban-add-btn"
                onClick={() => openCreateModal(col.key)}
                title={`Add task to ${col.label}`}
              >
                <PlusIcon size={16} />
              </button>
            </div>
            <div className="kanban-column-body">
              {columnTasks.length === 0 ? (
                <div className="kanban-empty">
                  <p>No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={(t) => setDeletingTask(t)}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        defaultStatus={defaultStatus}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
        danger
      />
    </div>
  );
}
