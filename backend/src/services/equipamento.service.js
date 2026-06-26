const fs = require('fs');
const path = require('path');
const prisma = require('../config/database'); // <-- Adicionado para acessar as fotos
const equipamentoRepository = require('../repositories/equipamento.repository');
const { createAuditLog } = require('../middlewares/auditLog');
const { AppError } = require('../middlewares/errorHandler');
const { buildPagination, buildPaginationMeta } = require('../utils/pagination');

const equipamentoService = {
  list: async (query = {}) => {
    const pagination = buildPagination(query);
    const filters = {
      search: query.search,
      categoria: query.categoria,
      marca: query.marca,
      clienteId: query.clienteId,
    };

    const [data, total] = await Promise.all([
      equipamentoRepository.findAll(filters, pagination),
      equipamentoRepository.count(filters),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  },

  getById: async (id) => {
    const equipamento = await equipamentoRepository.findById(id);

    if (!equipamento) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    return equipamento;
  },

  create: async (data, userId) => {
    const equipamento = await equipamentoRepository.create(data);

    await createAuditLog(userId, 'Equipamento', equipamento.id, 'CRIACAO', null, equipamento);

    return equipamento;
  },

  update: async (id, data, userId) => {
    const equipamentoAnterior = await equipamentoRepository.findById(id);

    if (!equipamentoAnterior) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    const equipamentoAtualizado = await equipamentoRepository.update(id, data);

    await createAuditLog(userId, 'Equipamento', id, 'EDICAO', equipamentoAnterior, equipamentoAtualizado);

    return equipamentoAtualizado;
  },

  delete: async (id, userId) => {
    const equipamento = await equipamentoRepository.findById(id);

    if (!equipamento) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    if (equipamento.ordensServico && equipamento.ordensServico.length > 0) {
      throw new AppError('Não é possível excluir o equipamento pois existem ordens de serviço associadas.', 409);
    }

    await equipamentoRepository.delete(id);

    await createAuditLog(userId, 'Equipamento', id, 'EXCLUSAO', equipamento, null);
  },

// --- NOVAS FUNÇÕES PARA FOTOS (CORRIGIDAS) ---

  adicionarFoto: async (equipamentoId, url, userId) => {
    const equipamento = await equipamentoRepository.findById(equipamentoId);
    
    if (!equipamento) {
      throw new AppError('Equipamento não encontrado.', 404);
    }

    const foto = await prisma.fotoEquipamento.create({
      data: {
        url,
        equipamentoId
      }
    });

    // CORREÇÃO: Usando 'EDICAO' em vez de 'UPLOAD_FOTO' para o banco aceitar o log
    await createAuditLog(userId, 'Equipamento', equipamentoId, 'EDICAO', null, { novaFoto: foto.url });

    return foto;
  },

removerFoto: async (fotoId, userId) => {
    // Adicione este log para vermos no terminal do Docker o que está chegando
    console.log("Tentando excluir a foto ID:", fotoId);

    const foto = await prisma.fotoEquipamento.findUnique({ where: { id: Number(fotoId) } });
    
    if (!foto) {
      console.log("Foto não encontrada no banco!");
      throw new AppError('Foto não encontrada.', 404);
    }

    // 1. Exclui o arquivo físico do servidor
    try {
      const filename = foto.url.split('/').pop();
      const filePath = path.join(__dirname, '../../uploads/equipamentos', filename);
      const fs = require('fs'); // Garantindo que o fs está disponível
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Falha ao excluir arquivo físico:', err);
    }

    // 2. Exclui o registro do banco de dados
    await prisma.fotoEquipamento.delete({ where: { id: fotoId } });

    // CORREÇÃO: Usando 'EDICAO' em vez de 'EXCLUSAO_FOTO' para o banco aceitar o log
    await createAuditLog(userId, 'Equipamento', foto.equipamentoId, 'EDICAO', { fotoRemovida: foto.url }, null);
  }
};

module.exports = equipamentoService;