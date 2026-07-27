import { useState, useEffect } from 'react';
import { CloseIcon } from '../ui/Icons';
import { DOMAIN_OPTIONS } from '../../utils/constants';

const initialFormState = {
  title: '',
  description: '',
  domain: '',
  status: 'PLANNED',
  startDate: new Date().toISOString().split('T')[0],
};

export default function ProjectFormModal({ isOpen, onClose, onSubmit, project = null }) {
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        domain: project.domain || '',
        status: project.status || 'PLANNED',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData(initialFormState);
    }
    setFormErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const clearError = (field) =>
    setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Project title is required";
    if (!formData.description.trim()) errors.description = "Project description is required";
    if (!formData.domain) errors.domain = "Please select a project domain";
    if (!formData.startDate) errors.startDate = "Start date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        domain: formData.domain,
        status: formData.status,
        startDate: formData.startDate,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setFormErrors({ server: err.response?.data?.message || 'Something went wrong' });
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

        {formErrors.server && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {formErrors.server}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Project Title *</label>
            <input
              type="text"
              className={`input-field ${formErrors.title ? 'input-error' : ''}`}
              value={formData.title}
              onChange={(e) => { setFormData({ ...formData, title: e.target.value }); clearError('title'); }}
            />
            {formErrors.title && <p className="input-error-message">{formErrors.title}</p>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Description *</label>
            <textarea
              className={`input-field ${formErrors.description ? 'input-error' : ''}`}
              value={formData.description}
              onChange={(e) => { setFormData({ ...formData, description: e.target.value }); clearError('description'); }}
              rows={3}
            />
            {formErrors.description && <p className="input-error-message">{formErrors.description}</p>}
          </div>

          {/* Domain & Status Side-by-Side Flex */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Domain *</label>
              <select
                className={`input-field ${formErrors.domain ? 'input-error' : ''}`}
                value={formData.domain}
                onChange={(e) => { setFormData({ ...formData, domain: e.target.value }); clearError('domain'); }}
              >
                <option value="">Select Domain</option>
                <option value="WEB_DEVELOPMENT">Web Development</option>
                <option value="APP_DEVELOPMENT">App Development</option>
                <option value="BACKEND">Backend</option>
                <option value="FULL_STACK">Full Stack</option>
                <option value="AI_ML">AI / ML</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="OTHER">Other</option>
              </select>
              {formErrors.domain && <p className="input-error-message">{formErrors.domain}</p>}
            </div>

            <div>
              <label className="input-label">Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Start Date Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Start Date *</label>
            <input
              type="date"
              className={`input-field ${formErrors.startDate ? 'input-error' : ''}`}
              value={formData.startDate}
              onChange={(e) => { setFormData({ ...formData, startDate: e.target.value }); clearError('startDate'); }}
            />
            {formErrors.startDate && <p className="input-error-message">{formErrors.startDate}</p>}
          </div>

          {/* Submit Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={Object.keys(formErrors).length > 0 || loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
