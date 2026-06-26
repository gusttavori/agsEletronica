const fs = require('fs');
const path = require('path');
const fotoEquipamentoRepository = require('../repositories/fotoEquipamento.repository');
const equipamentoRepository = require('../repositories/equipamento.repository');
const { AppError } = require('../middlewares/errorHandler');

const uploadService = {
  /**
   * Faz upload de foto de equipamento
   */
  uploadPhoto: async (equipamentoId, file, tipo, descricao) => {
    const equipamento = await equipamentoRepository.findById(equipamentoId);

    if (!equipamento) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    if (!file) {
      throw new AppError('Nenhum arquivo enviado.', 400);
    }

    const url = `/uploads/${file.filename}`;

    const foto = await fotoEquipamentoRepository.create({
      equipamentoId,
      url,
      tipo: tipo || null,
      descricao: descricao || null,
    });

    return foto;
  },

  /**
   * Exclui uma foto de equipamento
   */
  deletePhoto: async (id) => {
    const foto = await fotoEquipamentoRepository.findById(id);

    if (!foto) {
      throw new AppError('Foto não encontrada.', 404);
    }

    const filePath = path.join(process.cwd(), foto.url);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('[UPLOAD] Erro ao excluir arquivo:', error.message);
    }

    await fotoEquipamentoRepository.delete(id);
  },

  /**
   * Lista fotos de um equipamento
   */
  getPhotos: async (equipamentoId) => {
    const equipamento = await equipamentoRepository.findById(equipamentoId);

    if (!equipamento) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    return fotoEquipamentoRepository.findByEquipamentoId(equipamentoId);
  },
};

module.exports = uploadService;
