const prisma = require('../config/database');

const auditLogRepository = {
  /**
   * Lista logs de auditoria com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
    const where = {};

    if (filters.entidade) {
      where.entidade = filters.entidade;
    }

    if (filters.acao) {
      where.acao = filters.acao;
    }

    if (filters.usuarioId) {
      where.usuarioId = parseInt(filters.usuarioId, 10);
    }

    if (filters.entidadeId) {
      where.entidadeId = parseInt(filters.entidadeId, 10);
    }

    if (filters.dataInicio || filters.dataFim) {
      where.createdAt = {};
      if (filters.dataInicio) {
        where.createdAt.gte = new Date(filters.dataInicio);
      }
      if (filters.dataFim) {
        where.createdAt.lte = new Date(filters.dataFim);
      }
    }

    return prisma.auditLog.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
      },
    });
  },

  /**
   * Conta total de logs com filtros
   */
  count: async (filters = {}) => {
    const where = {};

    if (filters.entidade) where.entidade = filters.entidade;
    if (filters.acao) where.acao = filters.acao;
    if (filters.usuarioId) where.usuarioId = parseInt(filters.usuarioId, 10);
    if (filters.entidadeId) where.entidadeId = parseInt(filters.entidadeId, 10);

    return prisma.auditLog.count({ where });
  },

  /**
   * Cria um log de auditoria
   */
  create: async (data) => {
    return prisma.auditLog.create({ data });
  },
};

module.exports = auditLogRepository;
