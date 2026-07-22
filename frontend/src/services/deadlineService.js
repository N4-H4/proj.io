import api from './api';
import { API } from '../utils/constants';

/**
 * deadlineService
 *
 * Thin Axios wrapper for the /deadlines API.
 * Follows the same object-method pattern used throughout Proj.io services.
 *
 * Backend contract:
 *   GET   /api/v1/deadlines
 *         → DeadlineDTO[]  { id, title, deadline, projectTitle?, extensionCount? }
 *
 *   PATCH /api/v1/deadlines/{id}
 *         body: { deadline: string (YYYY-MM-DD) }
 *         → DeadlineDTO (updated item)
 *
 *   GET   /api/v1/deadlines/{id}/history
 *         → DeadlineRevisionDTO[]
 *            { id, previousDeadline, newDeadline, reason, updatedAt }
 */
export const deadlineService = {
  /**
   * Fetch all task deadlines for the authenticated user.
   * Splitting into upcoming/overdue is performed on the frontend.
   *
   * @returns {Promise<Array>}
   */
  async getAll() {
    const response = await api.get(API.DEADLINES);
    return response.data;
  },

  /**
   * Extend (update) a deadline's due date.
   *
   * @param {string|number} id          — deadline entity id
   * @param {string} newDeadline        — YYYY-MM-DD
   * @returns {Promise<Object>}         — updated DeadlineDTO
   */
  async extend(id, newDeadline) {
    const response = await api.patch(`${API.DEADLINES}/${id}`, {
      deadline: newDeadline,
    });
    return response.data;
  },

  /**
   * Fetch the revision history for a single deadline.
   *
   * @param {string|number} id    — deadline entity id
   * @returns {Promise<Array>}    — DeadlineRevisionDTO[]
   */
  async getHistory(id) {
    const response = await api.get(API.DEADLINE_HISTORY(id));
    return response.data;
  },
};
