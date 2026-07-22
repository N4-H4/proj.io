/**
 * EmptyState — shown when a deadline section has no items.
 * Props:
 *   message — string (e.g. "No upcoming deadlines.")
 */
export default function EmptyState({ message }) {
  return (
    <div className="deadline-empty-state" role="status" aria-live="polite">
      <span className="deadline-empty-icon" aria-hidden="true">—</span>
      <p className="deadline-empty-text">{message}</p>
    </div>
  );
}
