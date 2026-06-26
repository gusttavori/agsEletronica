const prisma = require('../config/database');
const ordemServicoRepository = require('../repositories/ordemServico.repository');
const bancoDefeitosRepository = require('../repositories/bancoDefeitos.repository');
const padraoDefeitoModeloRepository = require('../repositories/padraoDefeitoModelo.repository');
const { createAuditLog } = require('../middlewares/auditLog');
const { AppError } = require('../middlewares/errorHandler');
const { buildPagination, buildPaginationMeta } = require('../utils/pagination');
const { STATUS_LABELS } = require('../utils/constants');

const ordemServicoService = {
  list: async (query = {}) => {
    const pagination = buildPagination(query);
    const filters = {
      search: query.search,
      status: query.status,
      prioridade: query.prioridade,
      clienteId: query.clienteId,
      equipamentoId: query.equipamentoId,
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
    };

    const [data, total] = await Promise.all([
      ordemServicoRepository.findAll(filters, pagination),
      ordemServicoRepository.count(filters),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  },

  getById: async (id) => {
    const os = await prisma.ordemServico.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true,
        equipamento: {
          include: {
            fotos: true // <-- ESTA É A LINHA MÁGICA QUE FALTAVA
          }
        },
        historico: {
          orderBy: { createdAt: 'desc' }
        },
        itensOrcamento: true,
      }
    });

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    return os;
  },

  create: async (data, userId) => {
    const numeroOs = await ordemServicoRepository.getNextNumeroOs();

    const os = await prisma.ordemServico.create({
      data: {
        numeroOs,
        clienteId: data.clienteId,
        equipamentoId: data.equipamentoId,
        defeitoInformado: data.defeitoInformado || null,
        diagnostico: data.diagnostico || null,
        solucao: data.solucao || null,
        prioridade: data.prioridade || 'NORMAL',
        status: data.status || 'RECEBIDO',
        valorMaoObra: data.valorMaoObra || 0,
        valorTotal: data.valorTotal || 0,
        historico: {
          create: {
            statusAnterior: null,
            statusNovo: data.status || 'RECEBIDO',
            descricao: 'Ordem de serviço criada.',
          },
        },
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        equipamento: { select: { id: true, marca: true, modelo: true } },
        historico: true,
      },
    });

    await createAuditLog(userId, 'OrdemServico', os.id, 'CRIACAO', null, os);

    return os;
  },

  update: async (id, data, userId) => {
    const osAnterior = await ordemServicoRepository.findById(id);

    if (!osAnterior) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    if (osAnterior.status === 'ENTREGUE') {
      throw new AppError('Não é possível editar uma ordem de serviço já entregue.', 400);
    }

    const updateData = {};
    
    // Agora o backend processa e salva TODOS os campos enviados pela edição
    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.equipamentoId !== undefined) updateData.equipamentoId = data.equipamentoId;
    if (data.defeitoInformado !== undefined) updateData.defeitoInformado = data.defeitoInformado;
    if (data.diagnostico !== undefined) updateData.diagnostico = data.diagnostico;
    if (data.solucao !== undefined) updateData.solucao = data.solucao;
    if (data.prioridade !== undefined) updateData.prioridade = data.prioridade;
    if (data.valorMaoObra !== undefined) updateData.valorMaoObra = data.valorMaoObra;
    if (data.valorTotal !== undefined) updateData.valorTotal = data.valorTotal;

    // Se o status foi alterado no formulário, injeta no banco e cria log de movimentação
    if (data.status !== undefined && data.status !== osAnterior.status) {
      updateData.status = data.status;
      updateData.historico = {
        create: {
          statusAnterior: osAnterior.status,
          statusNovo: data.status,
          descricao: `Status alterado via edição direta da OS.`,
        },
      };
    }

    const osAtualizada = await ordemServicoRepository.update(id, updateData);

    await createAuditLog(userId, 'OrdemServico', id, 'EDICAO', osAnterior, osAtualizada);

    // Aciona a criação no banco de defeitos se o novo status for ENTREGUE
    if (data.status === 'ENTREGUE' && osAnterior.status !== 'ENTREGUE') {
      await ordemServicoService.createDefectEntryFromOS(osAtualizada);
    }

    return osAtualizada;
  },

  updateStatus: async (id, novoStatus, descricao, userId) => {
    const os = await ordemServicoRepository.findById(id);

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    if (os.status === novoStatus) {
      throw new AppError(`A ordem de serviço já está com o status "${STATUS_LABELS[novoStatus]}".`, 400);
    }

    const statusAnterior = os.status;

    const osAtualizada = await prisma.ordemServico.update({
      where: { id },
      data: {
        status: novoStatus,
        historico: {
          create: {
            statusAnterior,
            statusNovo: novoStatus,
            descricao: descricao || `Status alterado de "${STATUS_LABELS[statusAnterior]}" para "${STATUS_LABELS[novoStatus]}"`,
          },
        },
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        equipamento: {
          select: { id: true, marca: true, modelo: true, categoria: true },
        },
        historico: { orderBy: { createdAt: 'desc' } },
        itensOrcamento: true,
      },
    });

    await createAuditLog(userId, 'OrdemServico', id, 'MUDANCA_STATUS', { status: statusAnterior }, { status: novoStatus });

    if (novoStatus === 'ENTREGUE') {
      await ordemServicoService.createDefectEntryFromOS(osAtualizada);
    }

    return osAtualizada;
  },

  createDefectEntryFromOS: async (os) => {
    try {
      if (os.diagnostico && os.solucao) {
        const equipamento = os.equipamento;

        await bancoDefeitosRepository.create({
          marca: equipamento.marca,
          modelo: equipamento.modelo,
          categoria: equipamento.categoria,
          sintoma: os.defeitoInformado || 'Não informado',
          diagnostico: os.diagnostico,
          solucao: os.solucao,
          pecasUtilizadas: os.itensOrcamento
            ? os.itensOrcamento
                .filter((i) => i.tipo === 'PECA')
                .map((i) => `${i.descricao} (x${i.quantidade})`)
                .join(', ') || null
            : null,
          ordemServicoId: os.id,
        });

        const defeito = os.defeitoInformado || os.diagnostico;
        await padraoDefeitoModeloRepository.upsert(
          equipamento.marca,
          equipamento.modelo,
          equipamento.categoria,
          defeito
        );
      }
    } catch (error) {
      console.error('[OS] Erro ao criar entrada no banco de defeitos:', error.message);
    }
  },

  delete: async (id, userId) => {
    const os = await ordemServicoRepository.findById(id);

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    if (os.status === 'ENTREGUE') {
      throw new AppError('Não é possível excluir uma ordem de serviço já entregue.', 400);
    }

    await ordemServicoRepository.delete(id);

    await createAuditLog(userId, 'OrdemServico', id, 'EXCLUSAO', os, null);
  },

  getKanbanData: async () => {
    const statuses = ['RECEBIDO', 'EM_DIAGNOSTICO', 'AGUARDANDO_APROVACAO', 'EM_REPARO', 'PRONTO', 'ENTREGUE'];
    const kanban = {};

    for (const status of statuses) {
      const orders = await ordemServicoRepository.findByStatus(status);
      kanban[status] = {
        label: STATUS_LABELS[status],
        count: orders.length,
        orders,
      };
    }

    return kanban;
  },

  getOrcamento: async (id) => {
    return prisma.itemOrcamento.findMany({
      where: { ordemServicoId: Number(id) },
      orderBy: { createdAt: 'asc' }
    });
  },

  saveOrcamento: async (id, itens) => {
    const osId = Number(id);
    const valorTotal = itens.reduce((acc, item) => acc + (Number(item.valorUnitario) * Number(item.quantidade)), 0);

    await prisma.$transaction([
      prisma.itemOrcamento.deleteMany({ where: { ordemServicoId: osId } }),
      ...itens.map(item =>
        prisma.itemOrcamento.create({
          data: {
            ordemServicoId: osId,
            tipo: item.tipo,
            descricao: item.descricao,
            quantidade: Number(item.quantidade),
            valorUnitario: Number(item.valorUnitario),
            subtotal: Number(item.valorUnitario) * Number(item.quantidade)
          }
        })
      ),
      prisma.ordemServico.update({
        where: { id: osId },
        data: { valorTotal }
      })
    ]);

    return { message: "Orçamento salvo com sucesso", valorTotal };
  }
};

module.exports = ordemServicoService;