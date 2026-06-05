import { useState, useEffect } from 'react';
import { CloseIcon } from '../ui/Icons';
import { DOMAIN_OPTIONS } from '../../utils/constants';

const initialFormState = {
  title: '',
  description: '',
  domain: '',
  status: 'PLANNED',
  startDate: '',
  deadline: '',
};

export default function ProjectFormModal({ isOpen, onClose, onSubmit, project = null }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!project;

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        domain: project.domain || '',
        status: project.status || 'PLANNED',
        startDate: project.startDate || '',
        deadline: project.deadline || '',
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.length > 200) errs.title = 'Title must be at most 200 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        domain: form.domain || null,
        status: form.status,
        startDate: form.startDate || null,
        deadline: form.deadline || null,
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
          <h2>{isEdit ? 'Edit Project' : 'New Project'}</h2>
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
            <label className="input-label" htmlFor="project-title">Title *</label>
            <input
              id="project-title"
              name="title"
              type="text"
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="My Awesome Project"
              value={form.title}
              onChange={handleChange}
              autoFocus
            />
            {errors.title && <p className="input-error-message">{errors.title}</p>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="project-desc">Description</label>
            <textarea
              id="project-desc"
              name="description"
              className="input-field"
              placeholder="What is this project about?"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Domain */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="project-domain">Domain</label>
            <select
              id="project-domain"
              name="domain"
              className="input-field"
              value={form.domain}
              onChange={handleChange}
            >
              <option value="">Select a domain...</option>
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label" htmlFor="project-status">Status</label>
            <select
              id="project-status"
              name="status"
              className="input-field"
              value={form.status}
              onChange={handleChange}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label" htmlFor="project-start">Start Date</label>
              <input
                id="project-start"
                name="startDate"
                type="date"
                className="input-field"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="project-deadline">Deadline</label>
              <input
                id="project-deadline"
                name="deadline"
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
