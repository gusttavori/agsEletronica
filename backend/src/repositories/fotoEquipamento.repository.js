const prisma = require('../config/database');

const fotoEquipamentoRepository = {
  /**
   * Busca fotos por equipamento
   */
  findByEquipamentoId: async (equipamentoId) => {
    return prisma.fotoEquipamento.findMany({
      where: { equipamentoId },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Cria uma foto de equipamento
   */
  create: async (data) => {
    return prisma.fotoEquipamento.create({ data });
  },

  /**
   * Exclui uma foto de equipamento
   */
  delete: async (id) => {
    return prisma.fotoEquipamento.delete({
      where: { id },
    });
  },

  /**
   * Busca foto por ID
   */
  findById: async (id) => {
    return prisma.fotoEquipamento.findUnique({
      where: { id },
    });
  },
};

module.exports = fotoEquipamentoRepository;
