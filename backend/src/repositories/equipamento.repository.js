const prisma = require('../config/database');

const equipamentoRepository = {
  /**
   * Lista todos os equipamentos com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
    const where = buildWhere(filters);

    return prisma.equipamento.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true },
        },
        fotos: true,
        _count: {
          select: { ordensServico: true },
        },
      },
    });
  },

  /**
   * Busca equipamento por ID com relacionamentos
   */
  findById: async (id) => {
    return prisma.equipamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        fotos: true,
        ordensServico: {
          orderBy: { createdAt: 'desc' },
          include: {
            historico: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  },

  /**
   * Cria um novo equipamento
   */
  create: async (data) => {
    return prisma.equipamento.create({
      data,
      include: {
        cliente: {
          select: { id: true, nome: true },
        },
      },
    });
  },

  /**
   * Atualiza um equipamento
   */
  update: async (id, data) => {
    return prisma.equipamento.update({
      where: { id },
      data,
      include: {
        cliente: {
          select: { id: true, nome: true },
        },
      },
    });
  },

  /**
   * Exclui um equipamento
   */
  delete: async (id) => {
    return prisma.equipamento.delete({
      where: { id },
    });
  },

  /**
   * Conta total de equipamentos com filtros
   */
  count: async (filters = {}) => {
    const where = buildWhere(filters);
    return prisma.equipamento.count({ where });
  },
};

deleteFoto: async (fotoId) => {
  return await prisma.fotoEquipamento.delete({
    where: { id: Number(fotoId) }
  });
},

/**
 * Constrói condição WHERE para filtros de equipamento
 */
function buildWhere(filters) {
  const where = {};

  if (filters.categoria) {
    where.categoria = filters.categoria;
  }

  if (filters.marca) {
    where.marca = { contains: filters.marca, mode: 'insensitive' };
  }

  if (filters.clienteId) {
    where.clienteId = parseInt(filters.clienteId, 10);
  }

  if (filters.search) {
    where.OR = [
      { marca: { contains: filters.search, mode: 'insensitive' } },
      { modelo: { contains: filters.search, mode: 'insensitive' } },
      { numeroSerie: { contains: filters.search, mode: 'insensitive' } },
      { cliente: { nome: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}

module.exports = equipamentoRepository;
