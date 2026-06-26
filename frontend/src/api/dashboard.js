import api from './axios';

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
};

export default dashboardApi;
