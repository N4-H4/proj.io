import { useEffect, useState } from 'react';
import { CloseIcon } from '../ui/Icons';
import DeadlineView    from './DeadlineView';
import DeadlineHistory from './DeadlineHistory';

/**
 * DeadlineDetailsModal
 *
 * Orchestrates two top-level UI states:
 *   'view'    — info + inline edit slot (managed by DeadlineView)
 *   'history' — full timeline (managed by DeadlineHistory)
 *
 * The view ↔ edit transition is handled entirely within DeadlineView
 * so this orchestrator stays simple and focused on routing between
 * the two major modes.
 *
 * Props:
 *   deadline  — full deadline item object or null (null = modal hidden)
 *   onClose   — () => void
 *   onExtend  — (id, newDeadline: string) => Promise<void>
 */
export default function DeadlineDetailsModal({ deadline, onClose, onExtend }) {
  /* 'view' (includes inline edit) | 'history' */
  const [mode, setMode] = useState('view');

  /*
   * Local mirror of the deadline prop. Re-synced from the prop on every
   * re-render caused by a parent re-fetch, so extensionCount and deadline
   * date always reflect what the backend returned — never a client-side guess.
   */
  const [localDeadline, setLocalDeadline] = useState(null);

  /* Success message shown after a save */
  const [successMsg, setSuccessMsg] = useState('');

  /*
   * Always sync localDeadline from the prop so that after a save triggers
   * loadDeadlines() in the parent, the modal immediately reflects the updated
   * deadline date and the authoritative extensionCount from the backend.
   */
  useEffect(() => {
    if (deadline) {
      setLocalDeadline(deadline);
    }
  }, [deadline]);

  /*
   * Only reset mode and the success banner when a *different* deadline is
   * opened — not on a re-fetch of the same one (which would clear the
   * success message immediately after a save).
   */
  useEffect(() => {
    if (deadline) {
      setMode('view');
      setSuccessMsg('');
    }
  }, [deadline?.id]);

  /* ── ESC closes the modal from any mode ── */
  useEffect(() => {
    if (!deadline) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deadline, onClose]);

  if (!deadline || !localDeadline) return null;

  const { title } = localDeadline;
  const isHistory = mode === 'history';

  /* ── Save: update the modal state in-place; do NOT close ── */
  const handleSave = async (newDate) => {
    if (typeof onExtend === 'function') {
      await onExtend(localDeadline.id, newDate);
    }

    /* Show success banner */
    setSuccessMsg('Deadline updated successfully.');

    /* Auto-dismiss after 4 s */
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div
      className="modal-overlay deadline-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dm-title"
    >
      <div
        className={`modal-content dm-modal ${isHistory ? 'dm-modal--history' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════
            PERSISTENT HEADER — all modes
        ═══════════════════════════════════ */}
        <div className="modal-header dm-header">
          <div className="dm-header-left">
            <span className="deadline-type-chip deadline-type-chip-task">
              Task
            </span>
            <h2 id="dm-title" className="dm-title">{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* ═══════════════════════════════════
            SUCCESS BANNER
        ═══════════════════════════════════ */}
        {successMsg && (
          <div className="dm-success-banner" role="status" aria-live="polite">
            <span className="dm-success-icon" aria-hidden="true">✓</span>
            {successMsg}
          </div>
        )}

        {/* ═══════════════════════════════════
            BODY
        ═══════════════════════════════════ */}
        <div className="dm-body">

          {/* ── View mode (contains inline edit slot) ── */}
          {!isHistory && (
            <DeadlineView
              deadline={localDeadline}
              onHistoryClick={() => setMode('history')}
              onClose={onClose}
              onSave={handleSave}
            />
          )}

          {/* ── History mode: full body takeover ── */}
          {isHistory && (
            <DeadlineHistory
              deadline={localDeadline}
              onBack={() => setMode('view')}
            />
          )}

        </div>
      </div>
    </div>
  );
}
