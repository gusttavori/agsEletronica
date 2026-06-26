import api from './axios';

export const ordensServicoApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/ordens-servico', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/ordens-servico/${id}`);
    return data;
  },

  create: async (osData) => {
    const { data } = await api.post('/ordens-servico', osData);
    return data;
  },

  // Ajustado de update para update, mantendo consistência com o OrdemForm
  update: async (id, osData) => {
    const { data } = await api.put(`/ordens-servico/${id}`, osData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/ordens-servico/${id}`);
    return data;
  },

  updateStatus: async (id, status, descricao = '') => {
    const { data } = await api.patch(`/ordens-servico/${id}/status`, { status, descricao });
    return data;
  },

  getKanban: async () => {
    const { data } = await api.get('/ordens-servico/kanban');
    return data;
  },
};

export default ordensServicoApi;