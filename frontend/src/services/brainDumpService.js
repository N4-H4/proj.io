import api from './api';
import { API } from '../utils/constants';

export const brainDumpService = {
  async getAll(projectId = null) {
    const params = projectId ? { projectId } : {};
    const response = await api.get(API.BRAIN_DUMP, { params });
    return response.data;
  },

  async getGlobal() {
    const response = await api.get(`${API.BRAIN_DUMP}/global`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`${API.BRAIN_DUMP}/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post(API.BRAIN_DUMP, data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`${API.BRAIN_DUMP}/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`${API.BRAIN_DUMP}/${id}`);
  },
};
