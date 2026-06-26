import api from './axios';

export const globalSearchApi = {
  search: async (query) => {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  },
};

export default globalSearchApi;
