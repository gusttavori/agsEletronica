const uploadService = require('../services/upload.service');
const apiResponse = require('../utils/apiResponse');

const uploadController = {
  /**
   * POST /api/upload/:equipamentoId
   */
  uploadPhoto: async (req, res, next) => {
    try {
      const equipamentoId = parseInt(req.params.equipamentoId, 10);
      const { tipo, descricao } = req.body;
      const foto = await uploadService.uploadPhoto(equipamentoId, req.file, tipo, descricao);
      return apiResponse.created(res, foto);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/upload/:id
   */
  deletePhoto: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      await uploadService.deletePhoto(id);
      return apiResponse.success(res, { message: 'Foto excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/upload/equipamento/:equipamentoId
   */
  getPhotos: async (req, res, next) => {
    try {
      const equipamentoId = parseInt(req.params.equipamentoId, 10);
      const fotos = await uploadService.getPhotos(equipamentoId);
      return apiResponse.success(res, fotos);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = uploadController;
