const ordemServicoService = require('../services/ordemServico.service');
const apiResponse = require('../utils/apiResponse');

const ordemServicoController = {
  list: async (req, res, next) => {
    try {
      const result = await ordemServicoService.list(req.query);
      return apiResponse.success(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const os = await ordemServicoService.getById(id);
      return apiResponse.success(res, os);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const os = await ordemServicoService.create(req.body, req.user.id);
      return apiResponse.created(res, os);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const os = await ordemServicoService.update(id, req.body, req.user.id);
      return apiResponse.success(res, os);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, descricao } = req.body;
      const os = await ordemServicoService.updateStatus(id, status, descricao, req.user.id);
      return apiResponse.success(res, os);
    } catch (error) {
      next(error);
    }
  },

  kanban: async (req, res, next) => {
    try {
      const kanban = await ordemServicoService.getKanbanData();
      return apiResponse.success(res, kanban);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await ordemServicoService.delete(id, req.user.id);
      return apiResponse.success(res, { message: 'Ordem de serviço excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

  // -- NOVOS MÉTODOS DE ORÇAMENTO --
  getOrcamento: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const itens = await ordemServicoService.getOrcamento(id);
      return apiResponse.success(res, itens);
    } catch (error) {
      next(error);
    }
  },

  saveOrcamento: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { itens } = req.body;
      const result = await ordemServicoService.saveOrcamento(id, itens);
      return apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ordemServicoController;