import apiClient from './client.js';

export const getSupervisorDashboard = async () => {
  const res = await apiClient.get('/supervisor/dashboard');
  return res.data;
};

export const getViolations = async (params = {}) => {
  const res = await apiClient.get('/supervisor/violations', { params });
  return res.data;
};

export const acknowledgeViolation = async (id, notes = '') => {
  const res = await apiClient.patch(`/supervisor/violations/${id}/acknowledge`, { notes });
  return res.data;
};

export const exportReport = async (params = {}) => {
  const res = await apiClient.get('/supervisor/reports/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};

export const getSites = async () => {
  const res = await apiClient.get('/sites');
  return res.data;
};

export const getWorkers = async (params = {}) => {
  const res = await apiClient.get('/workers', { params });
  return res.data;
};

export const triggerSimulation = async (data = {}) => {
  const res = await apiClient.post('/simulation/trigger', data);
  return res.data;
};

export const forceEscalation = async () => {
  const res = await apiClient.post('/simulation/escalate-now');
  return res.data;
};
