import api from './api';
import { API } from '../utils/constants';

export const workflowService = {
  async getWorkflowByProjectId(projectId) {
    const response = await api.get(`${API.PROJECTS}/${projectId}/workflow`);
    return response.data;
  },

  async updateWorkflowPhase(projectId, phaseId, status) {
    const response = await api.put(`${API.PROJECTS}/${projectId}/workflow/${phaseId}`, { status });
    return response.data;
  },

  async updateActivePhase(projectId, phaseId) {
    await api.put(
      `${API.PROJECTS}/${projectId}/workflow/active-phase`,
      null,
      { params: { phaseId } }
    );
  },

  // ── WorkflowTask methods ─────────────────────────────────────────────────

  async getTasksByPhase(phaseId) {
    const response = await api.get(`/workflow-tasks/phase/${phaseId}`);
    return response.data;
  },

  async createTask(payload) {
    const response = await api.post('/workflow-tasks', payload);
    return response.data;
  },

  async updateTask(taskId, payload) {
    const response = await api.patch(`/workflow-tasks/${taskId}`, payload);
    return response.data;
  },

  async deleteTask(taskId) {
    await api.delete(`/workflow-tasks/${taskId}`);
  },
};
