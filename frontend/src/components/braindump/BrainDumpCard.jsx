import { formatDate } from '../../utils/dateUtils';

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

export default function BrainDumpCard({ note, onClick }) {
  const { bg, text } = getCategoryColor(note.category);

  return (
    <button
      type="button"
      className="note-sticky-card"
      onClick={() => onClick(note)}
      aria-label={`Open note: ${note.title}`}
    >
      <div className="note-sticky-top">
        <span
          className="note-category-badge"
          style={{ backgroundColor: bg, color: text }}
        >
          {note.category}
        </span>
      </div>

      <h3 className="note-sticky-title">{note.title}</h3>

      <p className="note-sticky-body">{note.body}</p>

      <div className="note-sticky-footer">
        <span className="note-sticky-date">{formatDate(note.createdAt)}</span>
      </div>
    </button>
  );
}
