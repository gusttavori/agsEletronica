const prisma = require('../config/database');

const itemOrcamentoRepository = {
  /**
   * Busca itens de orçamento por ordem de serviço
   */
  findByOrdemServicoId: async (ordemServicoId) => {
    return prisma.itemOrcamento.findMany({
      where: { ordemServicoId },
      orderBy: { createdAt: 'asc' },
    });
  },

  /**
   * Cria um item de orçamento
   */
  create: async (data) => {
    return prisma.itemOrcamento.create({ data });
  },

  /**
   * Atualiza um item de orçamento
   */
  update: async (id, data) => {
    return prisma.itemOrcamento.update({
      where: { id },
      data,
    });
  },

  /**
   * Exclui um item de orçamento
   */
  delete: async (id) => {
    return prisma.itemOrcamento.delete({
      where: { id },
    });
  },

  /**
   * Busca item por ID
   */
  findById: async (id) => {
    return prisma.itemOrcamento.findUnique({
      where: { id },
    });
  },
};

module.exports = itemOrcamentoRepository;
