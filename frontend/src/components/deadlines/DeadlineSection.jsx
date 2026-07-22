import DeadlineCard from './DeadlineCard';
import EmptyState from './EmptyState';

/**
 * DeadlineSection
 *
 * Renders a titled section ("Upcoming" or "Overdue") with a responsive card grid.
 * Props:
 *   title       — string   — section heading text
 *   items       — array    — deadline data objects
 *   isOverdue   — boolean  — passed to each DeadlineCard
 *   emptyMsg    — string   — displayed when items is empty
 *   onCardClick — (item) => void — bubbles up to DeadlinesPage to open the modal
 */
export default function DeadlineSection({ title, items, isOverdue, emptyMsg, onCardClick }) {
  return (
    <section className="deadline-section" aria-labelledby={`section-${title.toLowerCase()}`}>
      {/* Section header */}
      <div className="deadline-section-header">
        <span
          id={`section-${title.toLowerCase()}`}
          className={`deadline-section-title ${isOverdue ? 'deadline-section-title-overdue' : 'deadline-section-title-upcoming'}`}
        >
          {title}
        </span>
        <span className="deadline-section-count">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Grid or empty state */}
      {items.length === 0 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <div className="deadline-cards-grid">
          {items.map((item) => (
            <DeadlineCard
              key={item.id}
              {...item}
              isOverdue={isOverdue}
              onClick={() => onCardClick({ ...item, isOverdue })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
