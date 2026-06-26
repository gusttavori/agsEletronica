const prisma = require('../config/database');

const dashboardService = {
  /**
   * Extrai todos os dados reais do banco para popular a tela inicial do ERP
   */
  getStats: async () => {
    // 1. Busca o agrupamento de status das Ordens de Serviço (KPIs)
    const statusGroup = await prisma.ordemServico.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Inicializa os contadores zerados
    const statusCounts = {
      recebidos: 0,
      emDiagnostico: 0,
      aguardandoAprovacao: 0,
      emReparo: 0,
      prontos: 0,
      entregues: 0,
    };

    // Preenche os contadores com os dados reais do agrupamento
    statusGroup.forEach((item) => {
      if (item.status === 'RECEBIDO') statusCounts.recebidos = item._count.status;
      if (item.status === 'EM_DIAGNOSTICO') statusCounts.emDiagnostico = item._count.status;
      if (item.status === 'AGUARDANDO_APROVACAO') statusCounts.aguardandoAprovacao = item._count.status;
      if (item.status === 'EM_REPARO') statusCounts.emReparo = item._count.status;
      if (item.status === 'PRONTO') statusCounts.prontos = item._count.status;
      if (item.status === 'ENTREGUE') statusCounts.entregues = item._count.status;
    });

    // 2. Gráfico de Pizza: Equipamentos por Status (Filtra os que estão zerados)
    const equipamentosPorStatus = [
      { name: 'Recebidos', value: statusCounts.recebidos },
      { name: 'Em Diagnóstico', value: statusCounts.emDiagnostico },
      { name: 'Aguard. Aprovação', value: statusCounts.aguardandoAprovacao },
      { name: 'Em Reparo', value: statusCounts.emReparo },
      { name: 'Prontos', value: statusCounts.prontos },
      { name: 'Entregues', value: statusCounts.entregues },
    ].filter(item => item.value > 0);

    // 3. Gráfico de Barras: Serviços por Categoria de Equipamento
    // Como a categoria está na tabela relacionada, buscamos e agrupamos via código
    const ordensComCategoria = await prisma.ordemServico.findMany({
      select: {
        equipamento: {
          select: { categoria: true }
        }
      }
    });

    const categoriaCount = ordensComCategoria.reduce((acc, ordem) => {
      const cat = ordem.equipamento?.categoria;
      if (cat) {
        acc[cat] = (acc[cat] || 0) + 1;
      }
      return acc;
    }, {});

    // Formata a string das categorias (Ex: "DVD_BLURAY" vira "DVD BLURAY")
    const categoriaData = Object.keys(categoriaCount).map(key => ({
      categoria: key.replace('_', ' '), 
      total: categoriaCount[key]
    }));

    // 4. Tabela de Ordens Recentes (Busca as últimas 10)
    const ordensRecentesPrisma = await prisma.ordemServico.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cliente: {
          select: { nome: true },
        },
        equipamento: {
          select: { marca: true, modelo: true },
        },
      },
    });

    // Formata o retorno para o padrão exato que o frontend espera (numero_os)
    const recentOrders = ordensRecentesPrisma.map(ordem => ({
      ...ordem,
      numero_os: ordem.numeroOs, // Adaptação para o Dashboard.jsx
    }));

    return {
      statusCounts,
      equipamentosPorStatus,
      categoriaData,
      recentOrders,
    };
  },

  /**
   * Mantido caso o sistema evolua e passe a usar a rota isolada no futuro
   */
  getChartData: async () => {
    // Pode reaproveitar a lógica interna posteriormente
    return {};
  }
};

module.exports = dashboardService;