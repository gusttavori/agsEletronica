const equipamentoService = require('../services/equipamento.service');
const apiResponse = require('../utils/apiResponse');

const equipamentoController = {
  list: async (req, res, next) => {
    try {
      const result = await equipamentoService.list(req.query);
      return apiResponse.success(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const equipamento = await equipamentoService.getById(id);
      return apiResponse.success(res, equipamento);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const equipamento = await equipamentoService.create(req.body, req.user.id);
      return apiResponse.created(res, equipamento);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const equipamento = await equipamentoService.update(id, req.body, req.user.id);
      return apiResponse.success(res, equipamento);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await equipamentoService.delete(id, req.user.id);
      return apiResponse.success(res, { message: 'Equipamento excluído com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

// --- MÉTODO DE UPLOAD DE FOTOS ATUALIZADO ---
  uploadFoto: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhuma foto enviada.' });
      }

      const equipamentoId = parseInt(req.params.id, 10);
      
      const url = `/uploads/equipamentos/${req.file.filename}`;

      const foto = await equipamentoService.adicionarFoto(equipamentoId, url, req.user.id);
      
      return apiResponse.created(res, foto);
    } catch (error) {
      next(error);
    }
  },

  deleteFoto: async (req, res, next) => {
    try {
      const fotoId = parseInt(req.params.fotoId, 10);
      await equipamentoService.removerFoto(fotoId, req.user.id);
      return apiResponse.success(res, { message: 'Foto excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = equipamentoController;