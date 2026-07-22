import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../ui/ConfirmModal';
import { formatDateTime } from '../../utils/dateUtils';
import { EditIcon, TrashIcon, CloseIcon } from '../ui/Icons';

const CATEGORIES = [
  'General', 'Frontend', 'Backend', 'Database', 'API', 'UI/UX',
  'Testing', 'Bug', 'Feature', 'Research', 'Deployment', 'DevOps',
  'Documentation', 'Security', 'Optimization', 'Refactor', 'Meeting', 'Idea',
];

const CATEGORY_COLOR_MAP = {
  General:       { bg: '#E5E7EB', text: '#374151' },
  Frontend:      { bg: '#DBEAFE', text: '#1D4ED8' },
  Backend:       { bg: '#D1FAE5', text: '#065F46' },
  Database:      { bg: '#A7F3D0', text: '#064E3B' },
  API:           { bg: '#E0E7FF', text: '#3730A3' },
  'UI/UX':       { bg: '#FCE7F3', text: '#9D174D' },
  Testing:       { bg: '#FED7AA', text: '#C2410C' },
  Bug:           { bg: '#FEE2E2', text: '#B91C1C' },
  Feature:       { bg: '#CFFAFE', text: '#0E7490' },
  Research:      { bg: '#EDE9FE', text: '#6D28D9' },
  Deployment:    { bg: '#FEF9C3', text: '#A16207' },
  DevOps:        { bg: '#E2E8F0', text: '#334155' },
  Documentation: { bg: '#F0EAE2', text: '#78350F' },
  Security:      { bg: '#FFE4E6', text: '#9F1239' },
  Optimization:  { bg: '#ECFCCB', text: '#3F6212' },
  Refactor:      { bg: '#CCFBF1', text: '#134E4A' },
  Meeting:       { bg: '#F5F3FF', text: '#5B21B6' },
  Idea:          { bg: '#E0F2FE', text: '#075985' },
};

function getCategoryColor(categoryName) {
  return CATEGORY_COLOR_MAP[categoryName] ?? CATEGORY_COLOR_MAP.General;
}

export default function BrainDumpModal({ note, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editTitle, setEditTitle]     = useState(note.title);
  const [editCategory, setEditCategory] = useState(note.category);
  const [editBody, setEditBody]       = useState(note.body);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { bg, text } = getCategoryColor(isEditing ? editCategory : note.category);

  const handleEscape = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const handleStartEdit = () => {
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditBody(note.body);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setSaving(true);
    try {
      await onUpdate(note.id, {
        title:    editTitle.trim(),
        category: editCategory,
        content:  editBody.trim(),
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setConfirmingDelete(false);
    try {
      await onDelete(note.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
    <div
      className="modal-overlay braindump-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Note: ${note.title}`}
    >
      <div className="braindump-modal-paper">
        {/* Paper header line */}
        <div className="braindump-paper-rule" />

        {/* Top meta row */}
        <div className="braindump-modal-meta-row">
          <span
            className="note-category-badge"
            style={{ backgroundColor: bg, color: text }}
          >
            {isEditing ? editCategory : note.category}
          </span>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close note"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            className="input-field braindump-modal-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title..."
            autoFocus
          />
        ) : (
          <h2 className="braindump-modal-title">{note.title}</h2>
        )}

        {/* Dates */}
        <div className="braindump-modal-dates">
          <span>Created {formatDateTime(note.createdAt)}</span>
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <span>· Updated {formatDateTime(note.updatedAt)}</span>
          )}
        </div>

        {/* Divider */}
        <hr className="braindump-paper-divider" />

        {/* Category edit */}
        {isEditing && (
          <div className="braindump-modal-category-row">
            <label className="input-label" htmlFor="modal-category">Category</label>
            <select
              id="modal-category"
              className="input-field braindump-select"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Body */}
        {isEditing ? (
          <textarea
            className="input-field braindump-modal-body-input handwritten"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Write your thoughts..."
            rows={8}
          />
        ) : (
          <div className="braindump-modal-body handwritten">{note.body}</div>
        )}

        {/* Action row */}
        <div className="braindump-modal-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editBody.trim()}
                id="bd-modal-save-btn"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                disabled={saving}
                id="bd-modal-cancel-btn"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleStartEdit}
              id="bd-modal-edit-btn"
            >
              <EditIcon size={14} /> Edit
            </button>
          )}

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={deleting || saving}
            id="bd-modal-delete-btn"
          >
            <TrashIcon size={14} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      isOpen={confirmingDelete}
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={handleDelete}
      onCancel={() => setConfirmingDelete(false)}
      danger
    />
  </>
  );
}
