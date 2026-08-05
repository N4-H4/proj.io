import { useState, useEffect, useCallback, useMemo } from 'react';

import DeadlineSection from '../components/deadlines/DeadlineSection';
import DeadlineModal   from '../components/deadlines/DeadlineModal';
import { deadlineService } from '../services/deadlineService';
import { isDeadlinePassed } from '../utils/dateUtils';

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER — ascending date sort comparator (nearest deadline first).
───────────────────────────────────────────────────────────────────────────── */
function byDeadlineAsc(a, b) {
  return new Date(a.deadline) - new Date(b.deadline);
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER — split a flat API array into 2 sorted buckets: upcoming & overdue.

   Uses the project's existing `isDeadlinePassed` utility (dateUtils.js) which
   already strips the time component to midnight before comparing, ensuring
   consistent "today = upcoming" behaviour regardless of server timezone.

   Each bucket is sorted in ascending chronological order (nearest first).
   The input array is never mutated — both buckets are new arrays.

   Bucket shape: the raw DTO field names are preserved so that DeadlineCard
   and DeadlineModal receive them unmodified, ready for future API integration
   (e.g. Version Release deadlines).
───────────────────────────────────────────────────────────────────────────── */
function splitDeadlines(items) {
  const upcoming = [];
  const overdue  = [];

  for (const item of items) {
    (isDeadlinePassed(item.deadline) ? overdue : upcoming).push(item);
  }

  return {
    upcoming: [...upcoming].sort(byDeadlineAsc),
    overdue:  [...overdue].sort(byDeadlineAsc),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function DeadlinesPage() {
  const [selectedDeadline, setSelected] = useState(null);

  /* ── Async state ── */
  const [deadlines, setDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  /* ── Fetch ── */
  const loadDeadlines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deadlineService.getAll();
      setDeadlines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[DeadlinesPage] Failed to load deadlines:', err);
      setError('Could not load deadlines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeadlines();
  }, [loadDeadlines]);

  /* ── Split flat API array into upcoming / overdue buckets (memoized) ── */
  const { upcoming, overdue } = useMemo(() => splitDeadlines(deadlines), [deadlines]);

  /* ── Extend handler — calls PATCH /deadlines/{id}, then refreshes the list ── */
  const handleExtend = async (id, newDeadline) => {
    await deadlineService.extend(id, newDeadline);
    await loadDeadlines();
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */

  return (
    <div className="deadlines-page">


      {/* ── Loading state ── */}
      {isLoading && (
        <div className="loader" style={{ minHeight: '40vh' }}>
          <div className="loader-spinner" />
        </div>
      )}

      {/* ── Error state ── */}
      {!isLoading && error && (
        <div className="empty-state" style={{ minHeight: '40vh' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={loadDeadlines}>
            Retry
          </button>
        </div>
      )}

      {/* ── Main content (only when loaded without error) ── */}
      {!isLoading && !error && (
        <>
          <DeadlineSection
            title="Upcoming"
            items={upcoming}
            isOverdue={false}
            emptyMsg="No upcoming deadlines. You're all caught up!"
            onCardClick={setSelected}
          />

          <DeadlineSection
            title="Overdue"
            items={overdue}
            isOverdue={true}
            emptyMsg="No overdue deadlines. Great work staying on track!"
            onCardClick={setSelected}
          />
        </>
      )}

      {/* ── Deadline Detail / Extend Modal ── */}
      <DeadlineModal
        deadline={selectedDeadline}
        onClose={() => setSelected(null)}
        onExtend={handleExtend}
      />

    </div>
  );
}
