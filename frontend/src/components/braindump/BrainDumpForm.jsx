import { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '../ui/Icons';

const CATEGORIES = [
  'General', 'Frontend', 'Backend', 'Database', 'API', 'UI/UX',
  'Testing', 'Bug', 'Feature', 'Research', 'Deployment', 'DevOps',
  'Documentation', 'Security', 'Optimization', 'Refactor', 'Meeting', 'Idea',
];

export default function BrainDumpForm({ onSubmit, loading }) {
  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState({});

  const titleInputRef = useRef(null);

  // Clear a single field's error the moment the user starts correcting it
  const clearError = (field) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build error map for every empty required field
    const newErrors = {};
    if (!title.trim())   newErrors.title   = 'Title cannot be left empty';
    if (!content.trim()) newErrors.content = 'Content cannot be left empty';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), category, content: content.trim() });
      // Reset everything on success
      setTitle('');
      setCategory('General');
      setContent('');
      setErrors({});
      titleInputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="braindump-form-panel card card-decorated" onSubmit={handleSubmit} noValidate>
      <div className="braindump-form-title-row">
        <span className="braindump-form-label">✦ New Note</span>
      </div>

      <div className="braindump-form-fields">
        <div className="braindump-field-group braindump-field-title">
          <label className="input-label" htmlFor="bd-title">Title</label>
          <input
            id="bd-title"
            ref={titleInputRef}
            type="text"
            className={`input-field${errors.title ? ' input-error' : ''}`}
            placeholder="Note title..."
            value={title}
            onChange={(e) => { setTitle(e.target.value); clearError('title'); }}
            disabled={loading || submitting}
            autoComplete="off"
          />
          {errors.title && <p className="input-error-message">{errors.title}</p>}
        </div>

        <div className="braindump-field-group braindump-field-category">
          <label className="input-label" htmlFor="bd-category">Category</label>
          <select
            id="bd-category"
            className="input-field braindump-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading || submitting}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="braindump-field-group" style={{ marginTop: '0.75rem' }}>
        <label className="input-label" htmlFor="bd-content">Content</label>
        <textarea
          id="bd-content"
          className={`input-field handwritten${errors.content ? ' input-error' : ''}`}
          placeholder="Capture your thoughts, ideas, or anything on your mind..."
          value={content}
          onChange={(e) => { setContent(e.target.value); clearError('content'); }}
          rows={4}
          disabled={loading || submitting}
          style={{ fontSize: '1rem', lineHeight: '1.65' }}
        />
        {errors.content && <p className="input-error-message">{errors.content}</p>}
      </div>

      <div className="braindump-form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading || submitting}
          id="bd-submit-btn"
        >
          <PlusIcon size={14} />
          {submitting ? 'Adding...' : 'Add Note'}
        </button>
      </div>
    </form>
  );
}
