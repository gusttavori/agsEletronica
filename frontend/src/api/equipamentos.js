import api from './axios';

export const equipamentosApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/equipamentos', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/equipamentos/${id}`);
    return data;
  },

  create: async (equipamentoData) => {
    const { data } = await api.post('/equipamentos', equipamentoData);
    return data;
  },

  update: async (id, equipamentoData) => {
    const { data } = await api.put(`/equipamentos/${id}`, equipamentoData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/equipamentos/${id}`);
    return data;
  },

  uploadFoto: async (equipamentoId, formData) => {
    const { data } = await api.post(`/equipamentos/${equipamentoId}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  removeFoto: async (id) => {
    const { data } = await api.delete(`/equipamentos/fotos/${id}`);
    return data;
  },
};

export default equipamentosApi;
