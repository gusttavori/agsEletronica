const clienteRepository = require('../repositories/cliente.repository');
const { createAuditLog } = require('../middlewares/auditLog');
const { AppError } = require('../middlewares/errorHandler');
const { buildPagination, buildPaginationMeta } = require('../utils/pagination');

const clienteService = {
  /**
   * Lista clientes com filtros e paginação
   */
  list: async (query = {}) => {
    const pagination = buildPagination(query);
    const filters = {
      search: query.search,
    };

    const [data, total] = await Promise.all([
      clienteRepository.findAll(filters, pagination),
      clienteRepository.count(filters),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  },

  /**
   * Busca cliente por ID
   */
  getById: async (id) => {
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new AppError('Cliente não encontrado.', 404);
    }

    return cliente;
  },

  /**
   * Cria um novo cliente
   */
  create: async (data, userId) => {
    const cliente = await clienteRepository.create(data);

    await createAuditLog(userId, 'Cliente', cliente.id, 'CRIACAO', null, cliente);

    return cliente;
  },

  /**
   * Atualiza um cliente existente
   */
  update: async (id, data, userId) => {
    const clienteAnterior = await clienteRepository.findById(id);

    if (!clienteAnterior) {
      throw new AppError('Cliente não encontrado.', 404);
    }

    const clienteAtualizado = await clienteRepository.update(id, data);

    await createAuditLog(userId, 'Cliente', id, 'EDICAO', clienteAnterior, clienteAtualizado);

    return clienteAtualizado;
  },

  /**
   * Exclui um cliente
   */
  delete: async (id, userId) => {
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new AppError('Cliente não encontrado.', 404);
    }

    if (cliente.ordensServico && cliente.ordensServico.length > 0) {
      throw new AppError('Não é possível excluir o cliente pois existem ordens de serviço associadas.', 409);
    }

    await clienteRepository.delete(id);

    await createAuditLog(userId, 'Cliente', id, 'EXCLUSAO', cliente, null);
  },
};

module.exports = clienteService;
