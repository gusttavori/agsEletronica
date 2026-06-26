import api from './axios'; // Sua configuração padrão do Axios (ou ajuste se for outro nome)

const auditoriaApi = {
  getAll: async (params) => {
    try {
      const response = await api.get('/auditoria', { params });
      return response.data;
    } catch (error) {
      // Fallback temporário: Se o backend ainda não tiver a rota /auditoria, 
      // ele retorna esses dados fictícios para a tela não quebrar e você ver o design
      console.warn("Rota /auditoria não pronta no backend. Usando mock temporário.");
      return {
        data: [
          { 
            id: 1, 
            usuario: { nome: 'Administrador' }, 
            acao: 'UPDATE', 
            modulo: 'Ordem de Serviço', 
            detalhes: 'Atualizou status da OS #AGS-2026-0002 para PRONTO', 
            createdAt: new Date().toISOString() 
          },
          { 
            id: 2, 
            usuario: { nome: 'Administrador' }, 
            acao: 'CREATE', 
            modulo: 'Banco de Defeitos', 
            detalhes: 'Catalogou novo defeito para Samsung UN50TU8000', 
            createdAt: new Date(Date.now() - 3600000).toISOString() 
          },
        ]
      };
    }
  },
};

export default auditoriaApi;