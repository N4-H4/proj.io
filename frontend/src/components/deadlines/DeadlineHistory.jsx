import { useState, useEffect } from 'react';
import { ArrowLeftIcon, ClockIcon } from '../ui/Icons';
import { deadlineService } from '../../services/deadlineService';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

/* Human-readable labels for the action enum values from the backend */
const ACTION_LABELS = {
  DEADLINE_SET:         'Deadline Set',
  DEADLINE_RESCHEDULED: 'Deadline Rescheduled',
};

/**
 * DeadlineHistory — Fetches and renders the revision timeline for a deadline.
 *
 * Props:
 *   deadline     — full deadline item (id, deadline used for fetch + header)
 *   localHistory — optimistic entries injected by DeadlineModal after a save
 *   onBack       — () => void — returns to 'view' mode
 *
 * Backend contract:
 *   GET /api/v1/deadlines/{id}/history
 *   → DeadlineHistoryResponse[]
 *     { id, taskId, action, previousValue, newValue, changedBy, createdAt }
 *     Returned newest-first from the backend; no client-side sort needed.
 */
export default function DeadlineHistory({ deadline, onBack }) {
  const [fetchedHistory, setFetchedHistory] = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState(null);

  const history = fetchedHistory;

  const currentFormatted = new Date(deadline.deadline).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  });

  /* ── Fetch revision history whenever the deadline id changes ── */
  useEffect(() => {
    if (!deadline?.id) return;

    let cancelled = false; // guard against stale state on rapid open/close

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await deadlineService.getHistory(deadline.id);
        if (!cancelled) {
          setFetchedHistory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[DeadlineHistory] Failed to load history:', err);
          setError('Could not load revision history.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [deadline.id]);

  return (
    <div className="dm-history" role="region" aria-label="Deadline history">

      {/* ── Header: title + pinned current deadline badge ── */}
      <div className="dm-history-header">
        <div className="dm-history-title-row">
          <h3 className="dm-history-title">Deadline History</h3>
          <span className="dm-history-current-badge">
            <ClockIcon size={12} />
            Current: {currentFormatted}
          </span>
        </div>
        <p className="dm-history-subtitle">
          A chronological log of all deadline revisions for this item.
        </p>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="dm-history-loading" aria-live="polite" aria-busy="true">
          <div className="loader-spinner loader-spinner--sm" />
          <span className="dm-history-loading-text">Loading history…</span>
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div className="dm-history-empty" role="alert">
          <span className="dm-history-empty-icon" aria-hidden="true">⚠</span>
          <p className="dm-history-empty-text">{error}</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && history.length === 0 && (
        <div className="dm-history-empty">
          <span className="dm-history-empty-icon" aria-hidden="true">○</span>
          <p className="dm-history-empty-text">No deadline revisions yet.</p>
        </div>
      )}

      {/* ── Timeline ── */}
      {!isLoading && !error && history.length > 0 && (
        <ol className="dm-timeline" aria-label="Revision timeline">
          {history.map((entry, index) => (
            <li key={entry.id} className="dm-timeline-item">

              {/* Track: numbered dot + vertical connector */}
              <div className="dm-timeline-track">
                <span className="dm-timeline-dot" aria-hidden="true">{history.length - index}</span>
                {index < history.length - 1 && (
                  <span className="dm-timeline-connector" aria-hidden="true" />
                )}
              </div>

              {/* Content */}
              <div className="dm-timeline-content">
                {/* Action label + optional "New" badge */}
                <div className="dm-timeline-dates">
                  <span className="dm-timeline-new">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </div>

                {/* Previous → New date values */}
                <div className="dm-timeline-dates">
                  {entry.previousValue
                    ? <span className="dm-timeline-old">{formatDate(entry.previousValue)}</span>
                    : <span className="dm-timeline-old" aria-label="No previous deadline">—</span>
                  }
                  <span className="dm-timeline-arrow" aria-hidden="true">→</span>
                  <span className="dm-timeline-new">{formatDate(entry.newValue)}</span>
                </div>

                {/* Changed by (optional) */}
                {entry.changedBy && (
                  <p className="dm-timeline-reason">by {entry.changedBy}</p>
                )}

                {/* Timestamp */}
                <span className="dm-timeline-meta">
                  {formatDateTime(entry.createdAt)}
                </span>
              </div>

            </li>
          ))}
        </ol>
      )}

      {/* ── Back button ── */}
      <div className="dm-history-footer">
        <button
          id="btn-history-back"
          className="btn btn-ghost btn-sm"
          onClick={onBack}
        >
          <ArrowLeftIcon size={14} />
          Back to Details
        </button>
      </div>

    </div>
  );
}
