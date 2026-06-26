const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRelatorio = async (req, res) => {
  try {
    // Busca todos os itens do orçamento (Removemos a trava temporariamente para você validar o funcionamento)
    const itens = await prisma.itemOrcamento.findMany({
      include: {
        ordemServico: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const transacoes = itens.map(item => ({
      id: item.id,
      descricao: item.descricao,
      tipo: item.tipo, 
      valor: Number(item.subtotal),
      data: item.createdAt,
      osRelacionada: item.ordemServico.numeroOs
    }));

    res.json({ success: true, data: transacoes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados financeiros' });
  }
};

module.exports = { getRelatorio };