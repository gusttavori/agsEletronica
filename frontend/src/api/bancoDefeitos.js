import api from './axios';

export const bancoDefeitosApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/banco-defeitos', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/banco-defeitos/${id}`);
    return data;
  },

  create: async (defeitoData) => {
    const { data } = await api.post('/banco-defeitos', defeitoData);
    return data;
  },

  update: async (id, defeitoData) => {
    const { data } = await api.put(`/banco-defeitos/${id}`, defeitoData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/banco-defeitos/${id}`);
    return data;
  },

  searchByModelo: async (marca, modelo) => {
    const { data } = await api.get('/banco-defeitos/search', { params: { marca, modelo } });
    return data;
  },
};

export default bancoDefeitosApi;
