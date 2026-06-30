import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import ProjectFormModal from './ProjectFormModal';
import ConfirmModal from '../ui/ConfirmModal';
import { EditIcon, TrashIcon } from '../ui/Icons';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_LABELS, STATUS_BADGE_CLASS } from '../../utils/constants';

export default function ProjectOverview({ project, onProjectUpdated }) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdate = async (payload) => {
    const updated = await projectService.update(project.id, payload);
    onProjectUpdated(updated);
  };

  const handleDelete = async () => {
    await projectService.delete(project.id);
    navigate('/projects');
  };

  return (
    <div className="project-overview">
      {/* Actions */}
      <div className="overview-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
          <EditIcon size={14} /> Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
          <TrashIcon size={14} /> Delete
        </button>
      </div>

      {/* Info Grid */}
      <div className="overview-grid">
        <div className="overview-item">
          <span className="overview-label">Status</span>
          <span className={`badge ${STATUS_BADGE_CLASS[project.status] || 'badge-planned'}`}>
            {PROJECT_STATUS_LABELS[project.status] || project.status}
          </span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Domain</span>
          <span className="overview-value">{project.domain || 'Not set'}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Start Date</span>
          <span className="overview-value">{project.startDate ? formatDate(project.startDate) : 'Not set'}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Deadline</span>
          <span className="overview-value">{project.endDate ? formatDate(project.endDate) : 'Not set'}</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Tasks</span>
          <span className="overview-value">{project.completedTaskCount} / {project.taskCount} completed</span>
        </div>

        <div className="overview-item">
          <span className="overview-label">Progress</span>
          <div className="overview-progress">
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
            </div>
            <span className="progress-text">{project.progress || 0}%</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="overview-description">
          <h3 className="overview-section-title">Description</h3>
          <p>{project.description}</p>
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        project={project}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all tasks, notes, and workflow data. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        danger
      />
    </div>
  );
}
