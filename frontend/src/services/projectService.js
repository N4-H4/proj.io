import api from './api';
import { API } from '../utils/constants';

export const projectService = {
  async getAll(params = {}) {
    const response = await api.get(API.PROJECTS, { params });
    // Backend returns a paginated wrapper { content: [...] }; normalise to a plain array.
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  },

  async getProjectById(projectId) {
    const response = await api.get(`${API.PROJECTS}/${projectId}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post(API.PROJECTS, data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`${API.PROJECTS}/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`${API.PROJECTS}/${id}`);
  },

  async archive(id, archived = true) {
    const response = await api.put(`${API.PROJECTS}/${id}/archive`, { archived });
    return response.data;
  },

};
