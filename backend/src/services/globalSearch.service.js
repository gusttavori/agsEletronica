const prisma = require('../config/database');

const globalSearchService = {
  /**
   * Busca global em clientes, equipamentos, ordens de serviço e banco de defeitos
   */
  search: async (query) => {
    if (!query || query.trim().length < 2) {
      return {
        clientes: [],
        equipamentos: [],
        ordensServico: [],
        bancoDefeitos: [],
      };
    }

    const searchTerm = query.trim();

    const [clientes, equipamentos, ordensServico, bancoDefeitos] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          OR: [
            { nome: { contains: searchTerm, mode: 'insensitive' } },
            { telefone: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { whatsapp: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          telefone: true,
          email: true,
        },
      }),

      prisma.equipamento.findMany({
        where: {
          OR: [
            { marca: { contains: searchTerm, mode: 'insensitive' } },
            { modelo: { contains: searchTerm, mode: 'insensitive' } },
            { numeroSerie: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          marca: true,
          modelo: true,
          categoria: true,
          cliente: {
            select: { id: true, nome: true },
          },
        },
      }),

      prisma.ordemServico.findMany({
        where: {
          OR: [
            { numeroOs: { contains: searchTerm, mode: 'insensitive' } },
            { defeitoInformado: { contains: searchTerm, mode: 'insensitive' } },
            { diagnostico: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numeroOs: true,
          status: true,
          defeitoInformado: true,
          cliente: {
            select: { id: true, nome: true },
          },
          equipamento: {
            select: { id: true, marca: true, modelo: true },
          },
        },
      }),

      prisma.bancoDefeitos.findMany({
        where: {
          OR: [
            { marca: { contains: searchTerm, mode: 'insensitive' } },
            { modelo: { contains: searchTerm, mode: 'insensitive' } },
            { sintoma: { contains: searchTerm, mode: 'insensitive' } },
            { diagnostico: { contains: searchTerm, mode: 'insensitive' } },
            { solucao: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          marca: true,
          modelo: true,
          sintoma: true,
          diagnostico: true,
        },
      }),
    ]);

    return {
      clientes,
      equipamentos,
      ordensServico,
      bancoDefeitos,
      totalResults: clientes.length + equipamentos.length + ordensServico.length + bancoDefeitos.length,
    };
  },
};

module.exports = globalSearchService;
