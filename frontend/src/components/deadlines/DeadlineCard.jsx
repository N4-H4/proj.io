import { getDeadlineStatus } from '../../utils/dateUtils';
import { ClockIcon, AlertIcon } from '../ui/Icons';


/**
 * DeadlineCard
 *
 * Props (matches backend DTO — task deadlines only):
 *   id           — string | number
 *   title        — string
 *   deadline     — ISO date string
 *   projectTitle — string (optional, parent project context)
 *   isOverdue    — boolean (derived in parent)
 *   onClick      — () => void — opens the detail modal
 *
 * Note: extensionCount is intentionally NOT displayed here.
 *       It is shown only inside the DeadlineModal.
 */
export default function DeadlineCard({ id, title, deadline, projectTitle, isOverdue, onClick }) {
  /* Derive the fine-grained status (Upcoming / Due Today / Overdue).
     This supersedes the binary isOverdue boolean for badge rendering. */
  const { status, badgeClass } = getDeadlineStatus(deadline);

  const formattedDate = new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`deadline-card ${isOverdue ? 'deadline-card-overdue' : 'deadline-card-upcoming'}`}
      id={`deadline-card-task-${id}`}
      role="button"
      tabIndex={0}
      aria-label={`${title} — click to view details`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      {/* Top row: type chip + status badge */}
      <div className="deadline-card-top">
        <span className="deadline-type-chip deadline-type-chip-task">
          Task
        </span>
        <span className={badgeClass}>
          {status === 'Overdue'   && <><AlertIcon size={10} /> Overdue</>}
          {status === 'Due Today' && <><ClockIcon size={10} /> Due Today</>}
          {status === 'Upcoming'  && <><ClockIcon size={10} /> Upcoming</>}
        </span>
      </div>

      {/* Title */}
      <h3 className="deadline-card-title">{title}</h3>

      {/* Project context */}
      {projectTitle && (
        <p className="deadline-card-project">↳ {projectTitle}</p>
      )}

      {/* Footer: date */}
      <div className="deadline-card-footer">
        <ClockIcon size={13} />
        <span className="deadline-card-date">{formattedDate}</span>
      </div>
    </div>
  );
}
