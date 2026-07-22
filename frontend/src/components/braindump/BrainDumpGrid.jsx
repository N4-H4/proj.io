import BrainDumpCard from './BrainDumpCard';
import Pagination    from './Pagination';

export default function BrainDumpGrid({
  notes,
  totalNotes,
  loading,
  onCardClick,
  currentPage,
  totalPages,
  showingStart,
  showingEnd,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner" />
      </div>
    );
  }

  // Empty state: check against the full collection, not just the current page slice
  if (totalNotes === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-notes-text">No notes yet. Capture your first idea.</p>
      </div>
    );
  }

  return (
    <div className="notes-grid-wrapper">
      {/* Info counter */}
      <p className="notes-info-counter" aria-live="polite">
        Showing <strong>{showingStart}</strong>
        {showingStart !== showingEnd && (
          <>&ndash;<strong>{showingEnd}</strong></>
        )}{' '}
        of <strong>{totalNotes}</strong> note{totalNotes !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="notes-grid">
        {notes.map((note, index) => (
          <BrainDumpCard
            key={note.id}
            note={note}
            onClick={onCardClick}
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </div>

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
