const orcamentoService = require('../services/orcamento.service');
const apiResponse = require('../utils/apiResponse');

const orcamentoController = {
  /**
   * GET /api/orcamento/:ordemServicoId
   */
  getByOrdemServicoId: async (req, res, next) => {
    try {
      const ordemServicoId = parseInt(req.params.ordemServicoId, 10);
      const orcamento = await orcamentoService.getByOrdemServicoId(ordemServicoId);
      return apiResponse.success(res, orcamento);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/orcamento/:ordemServicoId/itens
   */
  addItem: async (req, res, next) => {
    try {
      const ordemServicoId = parseInt(req.params.ordemServicoId, 10);
      const item = await orcamentoService.addItem(ordemServicoId, req.body, req.user.id);
      return apiResponse.created(res, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/orcamento/itens/:id
   */
  updateItem: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await orcamentoService.updateItem(id, req.body, req.user.id);
      return apiResponse.success(res, item);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/orcamento/itens/:id
   */
  removeItem: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await orcamentoService.removeItem(id, req.user.id);
      return apiResponse.success(res, { message: 'Item removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orcamentoController;
