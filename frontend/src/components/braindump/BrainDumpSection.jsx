import { useState, useEffect } from 'react';
import { brainDumpService } from '../../services/brainDumpService';
import NoteCard from './NoteCard';
import ConfirmModal from '../ui/ConfirmModal';
import { PlusIcon, CloseIcon, BrainIcon } from '../ui/Icons';

export default function BrainDumpSection({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  const loadNotes = async () => {
    try {
      const data = await brainDumpService.getAll(projectId);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      if (editingNote) {
        const updated = await brainDumpService.update(editingNote.id, {
          content: content.trim(),
          projectId,
        });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const newNote = await brainDumpService.create({
          content: content.trim(),
          projectId,
        });
        setNotes((prev) => [newNote, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await brainDumpService.delete(deletingNote.id);
    setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
    setDeletingNote(null);
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setContent(note.content);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setContent('');
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner" />
      </div>
    );
  }

  return (
    <div className="braindump-section">
      {/* Header with add button */}
      <div className="braindump-header">
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <PlusIcon size={14} /> New Note
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="braindump-form card">
          <div className="braindump-form-header">
            <h3>{editingNote ? 'Edit Note' : 'New Note'}</h3>
            <button className="modal-close" onClick={resetForm}>
              <CloseIcon size={16} />
            </button>
          </div>
          <textarea
            className="input-field handwritten"
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            autoFocus
            style={{ fontSize: '1.1rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? 'Saving...' : editingNote ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BrainIcon size={48} />
          </div>
          <h3>Your mind is clear</h3>
          <p>Jot down ideas, plans, and random thoughts here. No structure needed!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onEdit={startEdit}
              onDelete={(n) => setDeletingNote(n)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingNote(null)}
        danger
      />
    </div>
  );
}
