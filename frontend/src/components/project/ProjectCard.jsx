import { useNavigate } from 'react-router-dom';
import { ProjectsIcon } from '../ui/Icons';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_LABELS, STATUS_BADGE_CLASS } from '../../utils/constants';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      className="card project-card card-decorated"
      onClick={() => navigate(`/projects/${project.id}`)}
      id={`project-card-${project.id}`}
    >
      {/* Folder tab */}
      <div className="project-folder-tab">
        <ProjectsIcon size={14} />
      </div>

      <div className="project-card-header">
        <h3 className="project-card-title">{project.title}</h3>
        <span className={`badge ${STATUS_BADGE_CLASS[project.status] || 'badge-planned'}`}>
          {PROJECT_STATUS_LABELS[project.status] || project.status}
        </span>
      </div>

      {project.domain && (
        <span className="domain-tag">{project.domain}</span>
      )}

      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}

      <div className="project-card-footer">
        <div className="project-card-dates">
          {project.startDate && (
            <span className="project-date">Started {formatDate(project.startDate)}</span>
          )}
          {project.deadline && (
            <span className="project-date">Due {formatDate(project.deadline)}</span>
          )}
        </div>
        <div className="project-card-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
          </div>
          <span className="progress-text">{project.progress || 0}%</span>
        </div>
      </div>
    </div>
  );
}
