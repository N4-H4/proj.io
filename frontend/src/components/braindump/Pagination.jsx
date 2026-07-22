/**
 * Pagination.jsx
 *
 * A purely presentational pagination control.
 * Displays up to 10 page number buttons at a time;
 * intelligently adds ellipsis (…) when total pages > 10.
 *
 * Props:
 *   currentPage  {number}   – 1-indexed active page
 *   totalPages   {number}   – total number of pages
 *   onPageChange {function} – called with the new page number
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // ── Page-window builder ──────────────────────────────────────────────────────
  // Returns an array of page numbers / 'ellipsis-start' / 'ellipsis-end' strings
  // to render, keeping the display to a max of 10 page buttons.
  const MAX_VISIBLE = 10;

  function buildPageItems() {
    if (totalPages <= MAX_VISIBLE) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first & last; fill the middle around currentPage
    const windowSize = MAX_VISIBLE - 2; // 8 interior slots
    const half = Math.floor(windowSize / 2);

    let rangeStart = Math.max(2, currentPage - half);
    let rangeEnd   = Math.min(totalPages - 1, rangeStart + windowSize - 1);

    // Clamp left edge if range fell short on the right
    if (rangeEnd - rangeStart + 1 < windowSize) {
      rangeStart = Math.max(2, rangeEnd - windowSize + 1);
    }

    const items = [1];
    if (rangeStart > 2)             items.push('ellipsis-start');
    for (let p = rangeStart; p <= rangeEnd; p++) items.push(p);
    if (rangeEnd < totalPages - 1)  items.push('ellipsis-end');
    items.push(totalPages);

    return items;
  }

  const pageItems = buildPageItems();
  const isFirst   = currentPage === 1;
  const isLast    = currentPage === totalPages;

  return (
    <nav className="pagination-nav" aria-label="Notes pagination">
      {/* First (<<) */}
      <button
        className="pagination-btn pagination-btn-edge"
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        aria-label="First page"
        title="First page"
      >
        «
      </button>

      {/* Previous (<) */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        title="Previous page"
      >
        ‹
      </button>

      {/* Page numbers / ellipsis */}
      {pageItems.map((item) => {
        if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          return (
            <span key={item} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <button
            key={item}
            className={`pagination-btn${isActive ? ' pagination-btn-active' : ''}`}
            onClick={() => !isActive && onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      {/* Next (>) */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        title="Next page"
      >
        ›
      </button>

      {/* Last (>>) */}
      <button
        className="pagination-btn pagination-btn-edge"
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        aria-label="Last page"
        title="Last page"
      >
        »
      </button>
    </nav>
  );
}
