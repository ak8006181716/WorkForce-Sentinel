import apiClient from './client.js';

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};
