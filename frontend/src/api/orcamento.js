import api from './axios'; // Ajuste se o seu arquivo for index.js

const orcamentoApi = {
  getByOrdemServico: async (ordemServicoId) => {
    const { data } = await api.get(`/ordens-servico/${ordemServicoId}/orcamento`);
    return data;
  },

  // Método que salva todos os itens de uma vez no banco
  save: async (ordemServicoId, itens) => {
    const { data } = await api.post(`/ordens-servico/${ordemServicoId}/orcamento`, { itens });
    return data;
  }
};

export default orcamentoApi;