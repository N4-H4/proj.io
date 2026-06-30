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
};
