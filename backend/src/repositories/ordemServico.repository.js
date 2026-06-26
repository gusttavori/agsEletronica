const prisma = require('../config/database');

const ordemServicoRepository = {
  /**
   * Lista todas as ordens de serviço com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
    const where = buildWhere(filters);

    return prisma.ordemServico.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true },
        },
        equipamento: {
          select: { id: true, marca: true, modelo: true, categoria: true },
        },
        _count: {
          select: {
            historico: true,
            itensOrcamento: true,
          },
        },
      },
    });
  },

  /**
   * Busca ordem de serviço por ID com todos os relacionamentos
   */
  findById: async (id) => {
    return prisma.ordemServico.findUnique({
      where: { id },
      include: {
        cliente: true,
        equipamento: {
          include: { fotos: true },
        },
        historico: {
          orderBy: { createdAt: 'desc' },
        },
        itensOrcamento: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  /**
   * Cria uma nova ordem de serviço
   */
  create: async (data) => {
    return prisma.ordemServico.create({
      data,
      include: {
        cliente: {
          select: { id: true, nome: true },
        },
        equipamento: {
          select: { id: true, marca: true, modelo: true },
        },
      },
    });
  },

  /**
   * Atualiza uma ordem de serviço
   */
  update: async (id, data) => {
    return prisma.ordemServico.update({
      where: { id },
      data,
      include: {
        cliente: {
          select: { id: true, nome: true },
        },
        equipamento: {
          select: { id: true, marca: true, modelo: true },
        },
        historico: {
          orderBy: { createdAt: 'desc' },
        },
        itensOrcamento: true,
      },
    });
  },

  /**
   * Exclui uma ordem de serviço
   */
  delete: async (id) => {
    return prisma.ordemServico.delete({
      where: { id },
    });
  },

  /**
   * Conta total de ordens de serviço com filtros
   */
  count: async (filters = {}) => {
    const where = buildWhere(filters);
    return prisma.ordemServico.count({ where });
  },

  /**
   * Busca ordens de serviço por status
   */
  findByStatus: async (status) => {
    return prisma.ordemServico.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true },
        },
        equipamento: {
          select: { id: true, marca: true, modelo: true, categoria: true },
        },
      },
    });
  },

  /**
   * Gera o próximo número de OS no formato AGS-YYYY-NNNN
   */
  getNextNumeroOs: async () => {
    const year = new Date().getFullYear();
    const prefix = `AGS-${year}-`;

    const lastOs = await prisma.ordemServico.findFirst({
      where: {
        numeroOs: { startsWith: prefix },
      },
      orderBy: { numeroOs: 'desc' },
    });

    let nextNumber = 1;
    if (lastOs) {
      const lastNumber = parseInt(lastOs.numeroOs.split('-').pop(), 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  },
};

/**
 * Constrói condição WHERE para filtros de ordem de serviço
 */
function buildWhere(filters) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.prioridade) {
    where.prioridade = filters.prioridade;
  }

  if (filters.clienteId) {
    where.clienteId = parseInt(filters.clienteId, 10);
  }

  if (filters.equipamentoId) {
    where.equipamentoId = parseInt(filters.equipamentoId, 10);
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

  if (filters.search) {
    where.OR = [
      { numeroOs: { contains: filters.search, mode: 'insensitive' } },
      { defeitoInformado: { contains: filters.search, mode: 'insensitive' } },
      { diagnostico: { contains: filters.search, mode: 'insensitive' } },
      { cliente: { nome: { contains: filters.search, mode: 'insensitive' } } },
      { equipamento: { marca: { contains: filters.search, mode: 'insensitive' } } },
      { equipamento: { modelo: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}

module.exports = ordemServicoRepository;
