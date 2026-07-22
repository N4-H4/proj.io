import { useState } from 'react';
import { ClockIcon, AlertIcon } from '../ui/Icons';

/**
 * DeadlineView — read-only info panel + inline edit slot.
 *
 * Edit mode is managed HERE (local state) so the form can spatially
 * replace the "Update Deadline" button in its exact vertical position —
 * above "View Deadline History" and "Close".
 *
 * Props:
 *   deadline       — full deadline item object
 *   onHistoryClick — () => void  — switches parent to 'history' mode
 *   onClose        — () => void
 *   onSave         — (newDate: string) => Promise<void>  — wired to parent's onExtend
 */
export default function DeadlineView({ deadline, onHistoryClick, onClose, onSave }) {
  /* Local edit toggle — no need to lift this state up */
  const [isEditing, setIsEditing] = useState(false);
  const [newDate,   setNewDate]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [dateError, setDateError] = useState('');

  const {
    deadline: currentDeadline,
    projectTitle,
    extensionCount = 0,
    isOverdue,
  } = deadline;

  const formattedDeadline = new Date(currentDeadline).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  });

  /* Minimum selectable date = today */
  const minDate = new Date().toISOString().split('T')[0];

  /* ── Open edit slot ── */
  const openEdit = () => {
    setNewDate(currentDeadline ?? '');
    setDateError('');
    setIsEditing(true);
  };

  /* ── Cancel — collapse form, restore button ── */
  const cancelEdit = () => {
    setIsEditing(false);
    setDateError('');
    setSaving(false);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!newDate) { setDateError('Please select a new deadline date.'); return; }
    if (newDate === currentDeadline) { setDateError('New deadline must differ from the current one.'); return; }

    setDateError('');
    setSaving(true);
    try {
      await onSave(newDate);
      /* Collapse edit slot back to the button — modal stays open */
      setIsEditing(false);
      setSaving(false);
      setNewDate('');
    } catch {
      setDateError('Failed to update the deadline. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="dm-view" role="region" aria-label="Deadline details">

      {/* ── Status badge + project context ── */}
      <div className="dm-status-row">
        <span className={`badge ${isOverdue ? 'badge-deadline-overdue' : 'badge-deadline-upcoming'}`}>
          {isOverdue
            ? <><AlertIcon size={10} /> Overdue</>
            : <><ClockIcon size={10} /> Upcoming</>}
        </span>
        {projectTitle && (
          <span className="dm-project-ref">↳ {projectTitle}</span>
        )}
      </div>

      {/* ── Info grid ── */}
      <div className="dm-info-grid">
        <div className="dm-info-cell">
          <span className="dm-info-label">Current Deadline</span>
          <span className="dm-info-value dm-info-value--date">
            <ClockIcon size={13} />
            {formattedDeadline}
          </span>
        </div>
        <div className="dm-info-cell">
          <span className="dm-info-label">Deadline Revisions</span>
          <span className="dm-info-value">
            <span className="dm-revision-count">{extensionCount}</span>
            <span className="dm-revision-unit">
              {extensionCount === 1 ? 'revision' : 'revisions'}
            </span>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ACTION AREA
          Slot 1 — spatially fixed: either the "Update Deadline"
                   button OR the inline edit form.
          Slot 2 — always present: "View Deadline History"
          Slot 3 — always present: "Close"
      ═══════════════════════════════════════════════════════ */}
      <div className="dm-actions-stack">

        {/* ── Slot 1: Update button ↔ Edit form (same vertical position) ── */}
        <div
          className={`dm-action-slot ${isEditing ? 'dm-action-slot--editing' : ''}`}
          aria-live="polite"
        >
          {/* Button state */}
          <div className="dm-slot-face dm-slot-face--button" aria-hidden={isEditing}>
            <button
              id="btn-update-deadline"
              className="btn btn-primary dm-slot-btn"
              onClick={openEdit}
              tabIndex={isEditing ? -1 : 0}
            >
              Update Deadline
            </button>
          </div>

          {/* Edit form state */}
          <div className="dm-slot-face dm-slot-face--form" aria-hidden={!isEditing}>
            <div className="dm-inline-form" role="form" aria-label="Update deadline form">
              <label htmlFor="dm-new-date" className="dm-edit-label">
                Extend Deadline To
              </label>

              <input
                id="dm-new-date"
                type="date"
                className={`input-field dm-date-input ${dateError ? 'input-error' : ''}`}
                value={newDate}
                min={minDate}
                onChange={(e) => { setNewDate(e.target.value); setDateError(''); }}
                tabIndex={isEditing ? 0 : -1}
                aria-describedby={dateError ? 'dm-date-error' : undefined}
              />

              {dateError && (
                <p id="dm-date-error" className="input-error-message" role="alert">
                  {dateError}
                </p>
              )}

              <div className="dm-inline-form-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={cancelEdit}
                  disabled={saving}
                  tabIndex={isEditing ? 0 : -1}
                >
                  Cancel
                </button>
                <button
                  id="btn-save-deadline"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving || !newDate || newDate === currentDeadline}
                  tabIndex={isEditing ? 0 : -1}
                >
                  {saving ? 'Saving…' : 'Save Deadline'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slot 2: always visible ── */}
        <button
          id="btn-view-history"
          className="btn btn-secondary dm-slot-btn"
          onClick={onHistoryClick}
        >
          View Deadline History
        </button>

        {/* ── Slot 3: always visible ── */}
        <button className="btn btn-ghost dm-slot-btn" onClick={onClose}>
          Close
        </button>

      </div>

    </div>
  );
}
