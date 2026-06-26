const clienteService = require('../services/cliente.service');
const apiResponse = require('../utils/apiResponse');

const clienteController = {
  /**
   * GET /api/clientes
   */
  list: async (req, res, next) => {
    try {
      const result = await clienteService.list(req.query);
      return apiResponse.success(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/clientes/:id
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const cliente = await clienteService.getById(id);
      return apiResponse.success(res, cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/clientes
   */
  create: async (req, res, next) => {
    try {
      const cliente = await clienteService.create(req.body, req.user.id);
      return apiResponse.created(res, cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/clientes/:id
   */
  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const cliente = await clienteService.update(id, req.body, req.user.id);
      return apiResponse.success(res, cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/clientes/:id
   */
  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await clienteService.delete(id, req.user.id);
      return apiResponse.success(res, { message: 'Cliente excluído com sucesso.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = clienteController;
