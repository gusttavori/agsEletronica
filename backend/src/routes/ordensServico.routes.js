const { Router } = require('express');
const { body } = require('express-validator');
const ordemServicoController = require('../controllers/ordemServico.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

const PRIORIDADES_VALIDAS = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];
const STATUS_VALIDOS = ['RECEBIDO', 'EM_DIAGNOSTICO', 'AGUARDANDO_APROVACAO', 'EM_REPARO', 'PRONTO', 'ENTREGUE'];

router.get('/kanban', verifyToken, ordemServicoController.kanban);
router.get('/', verifyToken, ordemServicoController.list);
router.get('/:id', verifyToken, ordemServicoController.getById);

router.post(
  '/',
  verifyToken,
  [
    body('clienteId').isInt({ min: 1 }).withMessage('ID do cliente é obrigatório.'),
    body('equipamentoId').isInt({ min: 1 }).withMessage('ID do equipamento é obrigatório.'),
    body('prioridade').optional().isIn(PRIORIDADES_VALIDAS).withMessage('Prioridade inválida.'),
  ],
  validateRequest,
  ordemServicoController.create
);

router.put(
  '/:id',
  verifyToken,
  [
    body('prioridade').optional().isIn(PRIORIDADES_VALIDAS).withMessage('Prioridade inválida.'),
  ],
  validateRequest,
  ordemServicoController.update
);

router.patch(
  '/:id/status',
  verifyToken,
  [
    body('status').isIn(STATUS_VALIDOS).withMessage('Status inválido.'),
    body('descricao').trim().notEmpty().withMessage('Descrição da movimentação é obrigatória.'),
  ],
  validateRequest,
  ordemServicoController.updateStatus
);

router.delete('/:id', verifyToken, ordemServicoController.delete);

router.get('/:id/orcamento', verifyToken, ordemServicoController.getOrcamento);
router.post('/:id/orcamento', verifyToken, ordemServicoController.saveOrcamento);

module.exports = router;