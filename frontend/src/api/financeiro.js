import api from './axios';

const financeiroApi = {
  getRelatorio: async () => {
    const response = await api.get('/financeiro');
    return response.data;
  }
};

export default financeiroApi;