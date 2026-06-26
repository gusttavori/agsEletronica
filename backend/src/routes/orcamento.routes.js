const { Router } = require('express');
const { body } = require('express-validator');
const orcamentoController = require('../controllers/orcamento.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

const TIPOS_VALIDOS = ['PECA', 'MAO_DE_OBRA'];

/**
 * @swagger
 * /api/orcamento/{ordemServicoId}:
 *   get:
 *     tags: [Orçamento]
 *     summary: Lista itens do orçamento de uma OS
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Itens do orçamento
 */
router.get('/:ordemServicoId', verifyToken, orcamentoController.getByOrdemServicoId);

/**
 * @swagger
 * /api/orcamento/{ordemServicoId}/itens:
 *   post:
 *     tags: [Orçamento]
 *     summary: Adiciona item ao orçamento
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemOrcamentoInput'
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 */
router.post(
  '/:ordemServicoId/itens',
  verifyToken,
  [
    body('tipo').isIn(TIPOS_VALIDOS).withMessage('Tipo deve ser PECA ou MAO_DE_OBRA.'),
    body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.'),
    body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser no mínimo 1.'),
    body('valorUnitario').isFloat({ min: 0 }).withMessage('Valor unitário inválido.'),
  ],
  validateRequest,
  orcamentoController.addItem
);

/**
 * @swagger
 * /api/orcamento/itens/{id}:
 *   put:
 *     tags: [Orçamento]
 *     summary: Atualiza item do orçamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemOrcamentoInput'
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 */
router.put(
  '/itens/:id',
  verifyToken,
  [
    body('tipo').optional().isIn(TIPOS_VALIDOS).withMessage('Tipo inválido.'),
    body('descricao').optional().trim().notEmpty().withMessage('Descrição não pode ser vazia.'),
    body('quantidade').optional().isInt({ min: 1 }).withMessage('Quantidade deve ser no mínimo 1.'),
    body('valorUnitario').optional().isFloat({ min: 0 }).withMessage('Valor unitário inválido.'),
  ],
  validateRequest,
  orcamentoController.updateItem
);

/**
 * @swagger
 * /api/orcamento/itens/{id}:
 *   delete:
 *     tags: [Orçamento]
 *     summary: Remove item do orçamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 */
router.delete('/itens/:id', verifyToken, orcamentoController.removeItem);

module.exports = router;
