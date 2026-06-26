const bancoDefeitosService = require('../services/bancoDefeitos.service');
const apiResponse = require('../utils/apiResponse');

const bancoDefeitosController = {
  /**
   * GET /api/banco-defeitos
   */
  list: async (req, res, next) => {
    try {
      const result = await bancoDefeitosService.list(req.query);
      
      // Blindagem: caso o service retorne direto o array em vez de { data, meta }
      const data = result?.data || result || [];
      const meta = result?.meta || {};
      
      return apiResponse.success(res, data, meta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/banco-defeitos/:id
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const defeito = await bancoDefeitosService.getById(id);
      return apiResponse.success(res, defeito);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/banco-defeitos
   */
  create: async (req, res, next) => {
    try {
      // Optional chaining (?.) protege caso o req.user venha vazio de algum middleware
      const userId = req.user?.id || null;
      const defeito = await bancoDefeitosService.create(req.body, userId);
      return apiResponse.created(res, defeito);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/banco-defeitos/:id
   */
  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id || null;
      const defeito = await bancoDefeitosService.update(id, req.body, userId);
      return apiResponse.success(res, defeito);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/banco-defeitos/:id
   */
  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id || null;
      await bancoDefeitosService.delete(id, userId);
      return apiResponse.success(res, { message: 'Registro excluído com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/banco-defeitos/search/:marca/:modelo
   */
  searchByModelo: async (req, res, next) => {
    try {
      const { marca, modelo } = req.params;
      const defeitos = await bancoDefeitosService.searchByModelo(marca, modelo);
      return apiResponse.success(res, defeitos);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bancoDefeitosController;