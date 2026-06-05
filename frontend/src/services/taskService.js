import api from './api';
import { API } from '../utils/constants';

export const taskService = {
  // Cross-project
  async getAll(params = {}) {
    const response = await api.get(API.TASKS, { params });
    return response.data;
  },

  // Project-scoped
  async getByProject(projectId) {
    const response = await api.get(`${API.PROJECTS}/${projectId}/tasks`);
    return response.data;
  },

  async getById(projectId, taskId) {
    const response = await api.get(`${API.PROJECTS}/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  async create(projectId, data) {
    const response = await api.post(`${API.PROJECTS}/${projectId}/tasks`, data);
    return response.data;
  },

  async update(projectId, taskId, data) {
    const response = await api.put(`${API.PROJECTS}/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  async updateStatus(projectId, taskId, status) {
    const response = await api.put(`${API.PROJECTS}/${projectId}/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async delete(projectId, taskId) {
    await api.delete(`${API.PROJECTS}/${projectId}/tasks/${taskId}`);
  },

  async reorder(projectId, taskIds) {
    const response = await api.put(`${API.PROJECTS}/${projectId}/tasks/reorder`, taskIds);
    return response.data;
  },
};
