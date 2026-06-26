const prisma = require('../config/database');

const clienteRepository = {
  /**
   * Lista todos os clientes com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
    const where = buildWhere(filters);

    return prisma.cliente.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            equipamentos: true,
            ordensServico: true,
          },
        },
      },
    });
  },

  /**
   * Busca cliente por ID com relacionamentos
   */
  findById: async (id) => {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        equipamentos: {
          orderBy: { createdAt: 'desc' },
          include: {
            fotos: true,
          },
        },
        ordensServico: {
          orderBy: { createdAt: 'desc' },
          include: {
            equipamento: {
              select: { marca: true, modelo: true, categoria: true },
            },
          },
        },
      },
    });
  },

  /**
   * Cria um novo cliente
   */
  create: async (data) => {
    return prisma.cliente.create({ data });
  },

  /**
   * Atualiza um cliente
   */
  update: async (id, data) => {
    return prisma.cliente.update({
      where: { id },
      data,
    });
  },

  /**
   * Exclui um cliente
   */
  delete: async (id) => {
    return prisma.cliente.delete({
      where: { id },
    });
  },

  /**
   * Conta total de clientes com filtros
   */
  count: async (filters = {}) => {
    const where = buildWhere(filters);
    return prisma.cliente.count({ where });
  },
};

/**
 * Constrói condição WHERE para filtros de cliente
 */
function buildWhere(filters) {
  const where = {};

  if (filters.search) {
    where.OR = [
      { nome: { contains: filters.search, mode: 'insensitive' } },
      { telefone: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { whatsapp: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

module.exports = clienteRepository;
