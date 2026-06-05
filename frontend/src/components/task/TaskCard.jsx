import { EditIcon, TrashIcon } from '../ui/Icons';
import { formatDate } from '../../utils/dateUtils';
import { TASK_PRIORITY_LABELS, PRIORITY_BADGE_CLASS } from '../../utils/constants';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={`task-card task-priority-${task.priority?.toLowerCase() || 'medium'}`} id={`task-${task.id}`}>
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <div className="task-card-actions">
          <button className="task-action-btn" onClick={() => onEdit(task)} title="Edit task">
            <EditIcon size={14} />
          </button>
          <button className="task-action-btn task-action-delete" onClick={() => onDelete(task)} title="Delete task">
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-meta">
        {task.dueDate && (
          <span className="task-card-date">{formatDate(task.dueDate)}</span>
        )}
        <span className={`badge ${PRIORITY_BADGE_CLASS[task.priority] || 'badge-medium'}`}>
          {TASK_PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>

      {/* Status selector for mobile / non-drag */}
      <select
        className="task-status-select"
        value={task.status}
        onChange={(e) => onStatusChange(task, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  );
}
