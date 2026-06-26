const prisma = require('../config/database');

const padraoDefeitoModeloRepository = {
  /**
   * Busca padrão de defeitos por marca e modelo
   */
  findByModelo: async (marca, modelo) => {
    return prisma.padraoDefeitoModelo.findUnique({
      where: {
        marca_modelo: { marca, modelo },
      },
    });
  },

  /**
   * Cria ou atualiza padrão de defeitos para um modelo
   */
  upsert: async (marca, modelo, categoria, defeito) => {
    const existing = await prisma.padraoDefeitoModelo.findUnique({
      where: {
        marca_modelo: { marca, modelo },
      },
    });

    if (existing) {
      const defeitosRecorrentes = existing.defeitosRecorrentes.includes(defeito)
        ? existing.defeitosRecorrentes
        : [...existing.defeitosRecorrentes, defeito];

      return prisma.padraoDefeitoModelo.update({
        where: { id: existing.id },
        data: {
          defeitosRecorrentes,
          ocorrencias: { increment: 1 },
          ultimaOcorrencia: new Date(),
        },
      });
    }

    return prisma.padraoDefeitoModelo.create({
      data: {
        marca,
        modelo,
        categoria,
        defeitosRecorrentes: [defeito],
        ocorrencias: 1,
        ultimaOcorrencia: new Date(),
      },
    });
  },

  /**
   * Lista todos os padrões de defeito com filtros e paginação
   */
  findAll: async (filters = {}, pagination = {}) => {
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

    const [data, total] = await Promise.all([
      prisma.padraoDefeitoModelo.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { ocorrencias: 'desc' },
      }),
      prisma.padraoDefeitoModelo.count({ where }),
    ]);

    return { data, total };
  },
};

module.exports = padraoDefeitoModeloRepository;
