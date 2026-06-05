import api from './api';
import { API } from '../utils/constants';

export const dashboardService = {
  async getStats() {
    const response = await api.get(API.DASHBOARD);
    return response.data;
  },

  async getDeadlines(days = 30) {
    const response = await api.get(API.DEADLINES, { params: { days } });
    return response.data;
  },
};
