const prisma = require('../config/database');

const bancoDefeitosRepository = {
  /**
   * Lista todos os registros do banco de defeitos com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
    const where = buildWhere(filters);

    return prisma.bancoDefeitos.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Busca registro por ID
   */
  findById: async (id) => {
    return prisma.bancoDefeitos.findUnique({
      where: { id },
    });
  },

  /**
   * Cria um novo registro no banco de defeitos
   */
  create: async (data) => {
    return prisma.bancoDefeitos.create({ data });
  },

  /**
   * Atualiza um registro do banco de defeitos
   */
  update: async (id, data) => {
    return prisma.bancoDefeitos.update({
      where: { id },
      data,
    });
  },

  /**
   * Exclui um registro do banco de defeitos
   */
  delete: async (id) => {
    return prisma.bancoDefeitos.delete({
      where: { id },
    });
  },

  /**
   * Conta total de registros com filtros
   */
  count: async (filters = {}) => {
    const where = buildWhere(filters);
    return prisma.bancoDefeitos.count({ where });
  },

  /**
   * Busca defeitos por marca e modelo
   */
  findByModelo: async (marca, modelo) => {
    return prisma.bancoDefeitos.findMany({
      where: {
        marca: { equals: marca, mode: 'insensitive' },
        modelo: { equals: modelo, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

/**
 * Constrói condição WHERE para filtros do banco de defeitos
 */
function buildWhere(filters) {
  const where = {};

  if (filters.marca) {
    where.marca = { contains: filters.marca, mode: 'insensitive' };
  }

  if (filters.modelo) {
    where.modelo = { contains: filters.modelo, mode: 'insensitive' };
  }

  if (filters.categoria) {
    where.categoria = filters.categoria;
  }

  if (filters.search) {
    where.OR = [
      { marca: { contains: filters.search, mode: 'insensitive' } },
      { modelo: { contains: filters.search, mode: 'insensitive' } },
      { sintoma: { contains: filters.search, mode: 'insensitive' } },
      { diagnostico: { contains: filters.search, mode: 'insensitive' } },
      { solucao: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

module.exports = bancoDefeitosRepository;
