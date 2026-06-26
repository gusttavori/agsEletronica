import api from './axios';

export const clientesApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/clientes', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  create: async (clienteData) => {
    const { data } = await api.post('/clientes', clienteData);
    return data;
  },

  update: async (id, clienteData) => {
    const { data } = await api.put(`/clientes/${id}`, clienteData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/clientes/${id}`);
    return data;
  },
};

export default clientesApi;
