const prisma = require('../config/database');

/**
 * Cria uma entrada no log de auditoria
 * @param {number|null} usuarioId - ID do usuário que realizou a ação
 * @param {string} entidade - Nome da entidade afetada (Cliente, Equipamento, OrdemServico, etc)
 * @param {number} entidadeId - ID da entidade afetada
 * @param {string} acao - Tipo da ação (CRIACAO, EDICAO, EXCLUSAO, MUDANCA_STATUS)
 * @param {Object|null} dadosAnteriores - Dados antes da alteração
 * @param {Object|null} dadosNovos - Dados após a alteração
 */
const createAuditLog = async (usuarioId, entidade, entidadeId, acao, dadosAnteriores = null, dadosNovos = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        usuarioId,
        entidade,
        entidadeId,
        acao,
        dadosAnteriores,
        dadosNovos,
      },
    });
  } catch (error) {
    console.error('[AUDIT LOG] Erro ao criar log de auditoria:', error.message);
  }
};

module.exports = {
  createAuditLog,
};
