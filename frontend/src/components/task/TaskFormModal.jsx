import { useState, useEffect } from 'react';
import { CloseIcon } from '../ui/Icons';

const initialFormState = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  status: 'TODO',
};

export default function TaskFormModal({ isOpen, onClose, onSubmit, task = null, defaultStatus = 'TODO' }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
      });
    } else {
      setForm({ ...initialFormState, status: defaultStatus });
    }
    setErrors({});
  }, [task, isOpen, defaultStatus]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: 'Task name is required' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        dueDate: form.dueDate || null,
        priority: form.priority,
        status: form.status,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </div>

        {errors.server && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="task-title">Task Name *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
            />
            {errors.title && <p className="input-error-message">{errors.title}</p>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              name="description"
              className="input-field"
              placeholder="Add more details..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Deadline + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label" htmlFor="task-due">Deadline</label>
              <input
                id="task-due"
                name="dueDate"
                type="date"
                className="input-field"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                name="priority"
                className="input-field"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Status (only in edit mode) */}
          {isEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                name="status"
                className="input-field"
                value={form.status}
                onChange={handleChange}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
