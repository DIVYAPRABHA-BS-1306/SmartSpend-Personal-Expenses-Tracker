import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const register = async (payload) => {
  const response = await axios.post(`${API_URL}/register`, payload);
  return response.data;
};

const login = async (payload) => {
  const response = await axios.post(`${API_URL}/login`, payload);
  return response.data;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('smartspend_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const authService = {
  register,
  login,
  getAuthHeaders,
};

export default authService;
