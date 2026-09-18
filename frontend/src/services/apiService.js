import axios from 'axios';
import authService from './authService.js';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartspend_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
  }
  return Promise.reject(error);
});

const apiService = {
  get: (path, config) => api.get(path, config),
  post: (path, payload) => api.post(path, payload),
  put: (path, payload) => api.put(path, payload),
  delete: (path) => api.delete(path),
};

export default apiService;
