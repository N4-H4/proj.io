import api from './api';
import { API } from '../utils/constants';

export const workflowService = {
  async getPhases(projectId) {
    const response = await api.get(`${API.PROJECTS}/${projectId}/workflow`);
    return response.data;
  },

  async updatePhaseStatus(projectId, phaseId, data) {
    const response = await api.put(`${API.PROJECTS}/${projectId}/workflow/${phaseId}`, data);
    return response.data;
  },
};
