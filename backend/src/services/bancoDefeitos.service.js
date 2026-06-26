const bancoDefeitosRepository = require('../repositories/bancoDefeitos.repository');
const ordemServicoRepository = require('../repositories/ordemServico.repository');
const { createAuditLog } = require('../middlewares/auditLog');
const { AppError } = require('../middlewares/errorHandler');
const { buildPagination, buildPaginationMeta } = require('../utils/pagination');

const bancoDefeitosService = {
  /**
   * Lista registros do banco de defeitos com filtros e paginação
   */
  list: async (query = {}) => {
    const pagination = buildPagination(query);
    const filters = {
      search: query.search,
      marca: query.marca,
      modelo: query.modelo,
      categoria: query.categoria,
    };

    const [data, total] = await Promise.all([
      bancoDefeitosRepository.findAll(filters, pagination),
      bancoDefeitosRepository.count(filters),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  },

  /**
   * Busca registro por ID
   */
  getById: async (id) => {
    const defeito = await bancoDefeitosRepository.findById(id);

    if (!defeito) {
      throw new AppError('Registro no banco de defeitos não encontrado.', 404);
    }

    return defeito;
  },

  /**
   * Cria um novo registro no banco de defeitos
   */
  create: async (data, userId) => {
    const defeito = await bancoDefeitosRepository.create(data);

    await createAuditLog(userId, 'BancoDefeitos', defeito.id, 'CRIACAO', null, defeito);

    return defeito;
  },

  /**
   * Atualiza um registro no banco de defeitos
   */
  update: async (id, data, userId) => {
    const defeitoAnterior = await bancoDefeitosRepository.findById(id);

    if (!defeitoAnterior) {
      throw new AppError('Registro no banco de defeitos não encontrado.', 404);
    }

    const defeitoAtualizado = await bancoDefeitosRepository.update(id, data);

    await createAuditLog(userId, 'BancoDefeitos', id, 'EDICAO', defeitoAnterior, defeitoAtualizado);

    return defeitoAtualizado;
  },

  /**
   * Exclui um registro do banco de defeitos
   */
  delete: async (id, userId) => {
    const defeito = await bancoDefeitosRepository.findById(id);

    if (!defeito) {
      throw new AppError('Registro no banco de defeitos não encontrado.', 404);
    }

    await bancoDefeitosRepository.delete(id);

    await createAuditLog(userId, 'BancoDefeitos', id, 'EXCLUSAO', defeito, null);
  },

  /**
   * Busca defeitos por marca e modelo
   */
  searchByModelo: async (marca, modelo) => {
    if (!marca || !modelo) {
      throw new AppError('Marca e modelo são obrigatórios para a busca.', 400);
    }

    return bancoDefeitosRepository.findByModelo(marca, modelo);
  },

  /**
   * Cria registro no banco de defeitos a partir de uma ordem de serviço
   */
  createFromOrdemServico: async (ordemServicoId) => {
    const os = await ordemServicoRepository.findById(ordemServicoId);

    if (!os) {
      throw new AppError('Ordem de serviço não encontrada.', 404);
    }

    if (!os.diagnostico || !os.solucao) {
      throw new AppError('A ordem de serviço precisa ter diagnóstico e solução preenchidos.', 400);
    }

    const pecasUtilizadas = os.itensOrcamento
      ? os.itensOrcamento
          .filter((i) => i.tipo === 'PECA')
          .map((i) => `${i.descricao} (x${i.quantidade})`)
          .join(', ') || null
      : null;

    const defeito = await bancoDefeitosRepository.create({
      marca: os.equipamento.marca,
      modelo: os.equipamento.modelo,
      categoria: os.equipamento.categoria,
      sintoma: os.defeitoInformado || 'Não informado',
      diagnostico: os.diagnostico,
      solucao: os.solucao,
      pecasUtilizadas,
      ordemServicoId: os.id,
    });

    return defeito;
  },
};

module.exports = bancoDefeitosService;
