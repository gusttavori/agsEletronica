const { Router } = require('express');
const auditLogController = require('../controllers/auditLog.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     tags: [Auditoria]
 *     summary: Lista logs de auditoria (somente administradores)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: entidade
 *         schema:
 *           type: string
 *         description: Filtrar por entidade (Cliente, Equipamento, OrdemServico, etc.)
 *       - in: query
 *         name: acao
 *         schema:
 *           type: string
 *           enum: [CRIACAO, EDICAO, EXCLUSAO, MUDANCA_STATUS]
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: entidadeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria
 *       403:
 *         description: Acesso negado
 */
router.get('/', verifyToken, requireRole(['ADMIN']), auditLogController.list);

module.exports = router;
