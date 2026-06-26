const prisma = require('../config/database');
const itemOrcamentoRepository = require('../repositories/itemOrcamento.repository');
const ordemServicoRepository = require('../repositories/ordemServico.repository');
const { createAuditLog } = require('../middlewares/auditLog');
const { AppError } = require('../middlewares/errorHandler');

const orcamentoService = {
  /**
   * Busca itens de orçamento por ordem de serviço
   */
  getByOrdemServicoId: async (ordemServicoId) => {
    const os = await ordemServicoRepository.findById(ordemServicoId);

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    const itens = await itemOrcamentoRepository.findByOrdemServicoId(ordemServicoId);

    return {
      ordemServicoId,
      numeroOs: os.numeroOs,
      itens,
      valorMaoObra: os.valorMaoObra,
      valorTotal: os.valorTotal,
    };
  },

  /**
   * Adiciona um item ao orçamento
   */
  addItem: async (ordemServicoId, data, userId) => {
    const os = await ordemServicoRepository.findById(ordemServicoId);

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    if (os.status === 'ENTREGUE') {
      throw new AppError('Não é possível alterar o orçamento de uma OS já entregue.', 400);
    }

    const subtotal = data.quantidade * data.valorUnitario;

    const item = await itemOrcamentoRepository.create({
      ordemServicoId,
      tipo: data.tipo,
      descricao: data.descricao,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
      subtotal,
    });

    await orcamentoService.calculateTotal(ordemServicoId);

    await createAuditLog(userId, 'ItemOrcamento', item.id, 'CRIACAO', null, item);

    return item;
  },

  /**
   * Atualiza um item do orçamento
   */
  updateItem: async (id, data, userId) => {
    const itemAnterior = await itemOrcamentoRepository.findById(id);

    if (!itemAnterior) {
      throw new AppError('Item de orçamento não encontrado.', 404);
    }

    const quantidade = data.quantidade !== undefined ? data.quantidade : itemAnterior.quantidade;
    const valorUnitario = data.valorUnitario !== undefined ? data.valorUnitario : Number(itemAnterior.valorUnitario);
    const subtotal = quantidade * valorUnitario;

    const updateData = {};
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.quantidade !== undefined) updateData.quantidade = data.quantidade;
    if (data.valorUnitario !== undefined) updateData.valorUnitario = data.valorUnitario;
    updateData.subtotal = subtotal;

    const itemAtualizado = await itemOrcamentoRepository.update(id, updateData);

    await orcamentoService.calculateTotal(itemAnterior.ordemServicoId);

    await createAuditLog(userId, 'ItemOrcamento', id, 'EDICAO', itemAnterior, itemAtualizado);

    return itemAtualizado;
  },

  /**
   * Remove um item do orçamento
   */
  removeItem: async (id, userId) => {
    const item = await itemOrcamentoRepository.findById(id);

    if (!item) {
      throw new AppError('Item de orçamento não encontrado.', 404);
    }

    await itemOrcamentoRepository.delete(id);

    await orcamentoService.calculateTotal(item.ordemServicoId);

    await createAuditLog(userId, 'ItemOrcamento', id, 'EXCLUSAO', item, null);
  },

  /**
   * Recalcula o valor total da ordem de serviço
   */
  calculateTotal: async (ordemServicoId) => {
    const itens = await itemOrcamentoRepository.findByOrdemServicoId(ordemServicoId);

    const valorTotal = itens.reduce((sum, item) => {
      return sum + Number(item.subtotal);
    }, 0);

    await prisma.ordemServico.update({
      where: { id: ordemServicoId },
      data: { valorTotal },
    });

    return valorTotal;
  },
};

module.exports = orcamentoService;
