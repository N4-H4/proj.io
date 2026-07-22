/**
 * Format a date string for display.
 * @param {string} dateStr - ISO date string (e.g. "2026-03-15")
 * @returns {string} Formatted date (e.g. "Mar 15, 2026")
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a datetime string for display.
 * @param {string} dateStr - ISO datetime string
 * @returns {string} Formatted datetime (e.g. "Mar 15, 2026 at 2:30 PM")
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get a human-readable relative time string.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "in 3 days", "2 days ago", "today"
 */
export function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Check if a deadline is approaching (within 3 days).
 */
export function isDeadlineUrgent(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const deadline = new Date(dateStr);
  const diffMs = deadline - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

/**
 * Check if a deadline has passed.
 */
export function isDeadlinePassed(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);
  return deadline < now;
}

/**
 * Classify a deadline into one of three statuses.
 * Strips the time component from both sides so the comparison
 * is purely date-based (midnight-to-midnight).
 *
 * @param {string} dateStr — ISO date string (e.g. "2026-07-13")
 * @returns {{ status: "Upcoming" | "Due Today" | "Overdue", badgeClass: string }}
 */
export function getDeadlineStatus(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline - now;

  if (diffMs < 0)  return { status: 'Overdue',   badgeClass: 'badge badge-deadline-overdue' };
  if (diffMs === 0) return { status: 'Due Today', badgeClass: 'badge badge-deadline-today' };
  return              { status: 'Upcoming',  badgeClass: 'badge badge-deadline-upcoming' };
}
