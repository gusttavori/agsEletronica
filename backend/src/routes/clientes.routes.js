const { Router } = require('express');
const { body } = require('express-validator');
const clienteController = require('../controllers/cliente.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista todos os clientes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, telefone ou email
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', verifyToken, clienteController.list);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/:id', verifyToken, clienteController.getById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Cria um novo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 */
router.post(
  '/',
  verifyToken,
  [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email inválido.'),
    body('telefone').optional({ nullable: true, checkFalsy: true }).isString(),
    body('whatsapp').optional({ nullable: true, checkFalsy: true }).isString(),
    body('endereco').optional({ nullable: true, checkFalsy: true }).isString(),
    body('observacoes').optional({ nullable: true, checkFalsy: true }).isString(),
  ],
  validateRequest,
  clienteController.create
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Atualiza um cliente
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
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 */
router.put(
  '/:id',
  verifyToken,
  [
    body('nome').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email inválido.'),
  ],
  validateRequest,
  clienteController.update
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Exclui um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 */
router.delete('/:id', verifyToken, clienteController.delete);

module.exports = router;
