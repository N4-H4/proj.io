import { useState, useEffect, useCallback } from 'react';
import { brainDumpService } from '../../services/brainDumpService';
import BrainDumpForm  from './BrainDumpForm';
import BrainDumpGrid  from './BrainDumpGrid';
import BrainDumpModal from './BrainDumpModal';

// --- Serialisation helpers ---
// title and category are encoded inside the content TEXT field as JSON so
// that no backend schema changes are required.

function serializeNote({ title, category, content }) {
  return JSON.stringify({ title, category, body: content });
}

function deserializeNote(rawNote) {
  let title    = '(untitled)';
  let category = 'General';
  let body     = rawNote.content ?? '';

  try {
    const parsed = JSON.parse(rawNote.content);
    if (parsed && typeof parsed === 'object' && 'body' in parsed) {
      title    = parsed.title    ?? title;
      category = parsed.category ?? category;
      body     = parsed.body     ?? body;
    }
  } catch {
    // Legacy plain-text note -- keep the raw content as body
  }

  return {
    ...rawNote,
    title,
    category,
    body,
  };
}

// --- Component ---

const NOTES_PER_PAGE = 20;

export default function BrainDumpSection({ projectId }) {
  const [notes,        setNotes]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [currentPage,  setCurrentPage]  = useState(1);

  // -- Data fetching --

  const loadNotes = useCallback(async () => {
    try {
      const rawNotes = await brainDumpService.getAll(projectId);
      setNotes(rawNotes.map(deserializeNote));
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    loadNotes();
  }, [loadNotes]);

  // Reset to page 1 whenever projectId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectId]);

  // -- Pagination math --

  const totalNotes       = notes.length;
  const totalPages       = Math.max(1, Math.ceil(totalNotes / NOTES_PER_PAGE));
  const safePage         = Math.min(currentPage, totalPages);
  const indexOfFirstNote = (safePage - 1) * NOTES_PER_PAGE;
  const indexOfLastNote  = Math.min(indexOfFirstNote + NOTES_PER_PAGE, totalNotes);
  const pagedNotes       = notes.slice(indexOfFirstNote, indexOfLastNote);

  // Info counter text, e.g. "Showing 1-20 of 87 notes"
  const showingStart = totalNotes === 0 ? 0 : indexOfFirstNote + 1;
  const showingEnd   = indexOfLastNote;

  // -- Handlers --

  const handleCreate = async ({ title, category, content }) => {
    const payload = {
      content:   serializeNote({ title, category, content }),
      projectId,
    };
    await brainDumpService.create(payload);
    await loadNotes();
  };

  const handleUpdate = async (noteId, { title, category, content }) => {
    const payload = {
      content:   serializeNote({ title, category, content }),
      projectId,
    };
    await brainDumpService.update(noteId, payload);
    // Refresh the grid and patch selectedNote so the modal shows fresh data
    const rawNotes  = await brainDumpService.getAll(projectId);
    const refreshed = rawNotes.map(deserializeNote);
    setNotes(refreshed);
    const updatedNote = refreshed.find((n) => n.id === noteId);
    if (updatedNote) setSelectedNote(updatedNote);
  };

  const handleDelete = async (noteId) => {
    await brainDumpService.delete(noteId);
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== noteId);
      // Edge case: if deleting leaves the current page empty, fall back one page
      const nextTotalPages = Math.max(1, Math.ceil(next.length / NOTES_PER_PAGE));
      setCurrentPage((p) => Math.min(p, nextTotalPages));
      return next;
    });
    handleModalClose();
  };

  const handleCardClick = (note) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNote(null);
  };

  // -- Render --

  return (
    <div className="braindump-section">
      <div className="braindump-layout">
        <BrainDumpForm
          onSubmit={handleCreate}
          loading={loading}
        />

        <BrainDumpGrid
          notes={pagedNotes}
          totalNotes={totalNotes}
          loading={loading}
          onCardClick={handleCardClick}
          currentPage={safePage}
          totalPages={totalPages}
          showingStart={showingStart}
          showingEnd={showingEnd}
          onPageChange={setCurrentPage}
        />
      </div>

      {modalOpen && selectedNote && (
        <BrainDumpModal
          note={selectedNote}
          onClose={handleModalClose}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
