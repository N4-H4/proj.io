import api from './api';
import { API } from '../utils/constants';

export const authService = {
  async signup(data) {
    const response = await api.post(API.AUTH.SIGNUP, data);
    return response.data;
  },

  async login(data) {
    const response = await api.post(API.AUTH.LOGIN, data);
    return response.data;
  },

  async logout() {
    const response = await api.post(API.AUTH.LOGOUT);
    return response.data;
  },
};
