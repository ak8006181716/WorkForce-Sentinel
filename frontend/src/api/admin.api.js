import apiClient from './client.js';

export const getDashboard = async () => {
  const res = await apiClient.get('/admin/dashboard');
  return res.data;
};

export const getSupervisors = async (params = {}) => {
  const res = await apiClient.get('/admin/supervisors', { params });
  return res.data;
};

export const createSupervisor = async (data) => {
  const res = await apiClient.post('/admin/supervisors', data);
  return res.data;
};

export const updateSupervisor = async (id, data) => {
  const res = await apiClient.put(`/admin/supervisors/${id}`, data);
  return res.data;
};

export const deleteSupervisor = async (id) => {
  const res = await apiClient.delete(`/admin/supervisors/${id}`);
  return res.data;
};

export const getAlerts = async (params = {}) => {
  const res = await apiClient.get('/admin/alerts', { params });
  return res.data;
};

export const getInsights = async () => {
  const res = await apiClient.get('/admin/insights');
  return res.data;
};
