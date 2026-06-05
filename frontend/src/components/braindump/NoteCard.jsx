import { EditIcon, TrashIcon } from '../ui/Icons';
import { formatDateTime } from '../../utils/dateUtils';

export default function NoteCard({ note, index, onEdit, onDelete }) {
  return (
    <div className="note-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="note-content handwritten">{note.content}</div>
      <div className="note-meta">
        <span>{formatDateTime(note.createdAt)}</span>
        <div className="note-actions">
          <button className="task-action-btn" onClick={() => onEdit(note)} title="Edit note">
            <EditIcon size={13} />
          </button>
          <button className="task-action-btn task-action-delete" onClick={() => onDelete(note)} title="Delete note">
            <TrashIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
