const prisma = require('../config/database');

const dashboardRepository = {
  /**
   * Conta ordens de serviço agrupadas por status
   */
  getStatusCounts: async () => {
    const counts = await prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const result = {};
    counts.forEach((item) => {
      result[item.status] = item._count.status;
    });

    return result;
  },

  /**
   * Conta serviços agrupados por categoria de equipamento
   */
  getServicesByCategory: async () => {
    const result = await prisma.$queryRaw`
      SELECT e.categoria, COUNT(os.id)::int as total
      FROM ordens_servico os
      JOIN equipamentos e ON os.equipamento_id = e.id
      GROUP BY e.categoria
      ORDER BY total DESC
    `;
    return result;
  },

  /**
   * Conta equipamentos agrupados por status das OS
   */
  getEquipmentByStatus: async () => {
    const result = await prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { equipamentoId: true },
    });

    return result.map((item) => ({
      status: item.status,
      total: item._count.equipamentoId,
    }));
  },

  /**
   * Busca ordens de serviço recentes
   */
  getRecentOrders: async (limit = 10) => {
    return prisma.ordemServico.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { id: true, nome: true },
        },
        equipamento: {
          select: { id: true, marca: true, modelo: true, categoria: true },
        },
      },
    });
  },

  /**
   * Estatísticas mensais dos últimos 12 meses
   */
  getMonthlyStats: async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const result = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as mes,
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'ENTREGUE' THEN 1 END)::int as concluidos,
        COALESCE(SUM(valor_total), 0)::float as faturamento
      FROM ordens_servico
      WHERE created_at >= ${twelveMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY mes ASC
    `;

    return result;
  },

  /**
   * Contadores gerais do sistema
   */
  getGeneralCounts: async () => {
    const [totalClientes, totalEquipamentos, totalOS, totalDefects] = await Promise.all([
      prisma.cliente.count(),
      prisma.equipamento.count(),
      prisma.ordemServico.count(),
      prisma.bancoDefeitos.count(),
    ]);

    return {
      totalClientes,
      totalEquipamentos,
      totalOS,
      totalDefects,
    };
  },
};

module.exports = dashboardRepository;
