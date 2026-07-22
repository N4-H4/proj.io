import { useState } from 'react';

/**
 * DeadlineEdit — Inline edit panel, revealed with a CSS max-height animation.
 * Sits BELOW the DeadlineView content — does not replace it.
 *
 * Props:
 *   currentDeadline — ISO date string (current value to pre-fill)
 *   onSave          — (newDate: string) => Promise<void>
 *   onCancel        — () => void — switches parent back to 'view' mode
 */
export default function DeadlineEdit({ currentDeadline, onSave, onCancel }) {
  const [newDate, setNewDate]   = useState(currentDeadline ?? '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  /* Today in YYYY-MM-DD — prevent selecting dates in the past */
  const minDate = new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    if (!newDate) { setError('Please select a new deadline date.'); return; }
    if (newDate === currentDeadline) { setError('The new deadline must differ from the current one.'); return; }

    setError('');
    setSaving(true);
    try {
      await onSave(newDate);
    } catch {
      setError('Failed to update the deadline. Please try again.');
      setSaving(false);
    }
  };

  return (
    /* dm-edit-panel animates open via CSS max-height transition applied in deadlines.css */
    <div className="dm-edit-panel" role="region" aria-label="Edit deadline">

      <div className="dm-edit-inner">
        <hr className="dm-divider" />

        {/* Form */}
        <div className="dm-edit-form">
          <label htmlFor="dm-new-date" className="dm-edit-label">
            Extend Deadline To
          </label>

          <div className="dm-edit-row">
            <input
              id="dm-new-date"
              type="date"
              className={`input-field dm-date-input ${error ? 'input-error' : ''}`}
              value={newDate}
              min={minDate}
              onChange={(e) => { setNewDate(e.target.value); setError(''); }}
              aria-describedby={error ? 'dm-date-error' : undefined}
            />
          </div>

          {error && (
            <p id="dm-date-error" className="input-error-message" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="dm-edit-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            id="btn-save-deadline"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || !newDate || newDate === currentDeadline}
          >
            {saving ? 'Saving…' : 'Save Deadline'}
          </button>
        </div>
      </div>

    </div>
  );
}
