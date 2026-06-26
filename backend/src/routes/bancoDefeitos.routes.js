const { Router } = require('express');
const { body } = require('express-validator');
const bancoDefeitosController = require('../controllers/bancoDefeitos.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

const CATEGORIAS_VALIDAS = ['TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'];

/**
 * @swagger
 * /api/banco-defeitos/search/{marca}/{modelo}:
 *   get:
 *     tags: [Banco de Defeitos]
 *     summary: Busca defeitos por marca e modelo
 *     parameters:
 *       - in: path
 *         name: marca
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: modelo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de defeitos encontrados
 */
router.get('/search/:marca/:modelo', verifyToken, bancoDefeitosController.searchByModelo);

/**
 * @swagger
 * /api/banco-defeitos:
 *   get:
 *     tags: [Banco de Defeitos]
 *     summary: Lista registros do banco de defeitos
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de defeitos
 */
router.get('/', verifyToken, bancoDefeitosController.list);

/**
 * @swagger
 * /api/banco-defeitos/{id}:
 *   get:
 *     tags: [Banco de Defeitos]
 *     summary: Busca defeito por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do defeito
 */
router.get('/:id', verifyToken, bancoDefeitosController.getById);

/**
 * @swagger
 * /api/banco-defeitos:
 *   post:
 *     tags: [Banco de Defeitos]
 *     summary: Cria um registro no banco de defeitos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BancoDefeitosInput'
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 */
router.post(
  '/',
  verifyToken,
  [
    body('marca').trim().notEmpty().withMessage('Marca é obrigatória.'),
    body('modelo').trim().notEmpty().withMessage('Modelo é obrigatório.'),
    body('categoria').isIn(CATEGORIAS_VALIDAS).withMessage('Categoria inválida.'),
    body('sintoma').trim().notEmpty().withMessage('Sintoma é obrigatório.'),
    body('diagnostico').trim().notEmpty().withMessage('Diagnóstico é obrigatório.'),
    body('solucao').trim().notEmpty().withMessage('Solução é obrigatória.'),
    body('pecasUtilizadas').optional({ nullable: true, checkFalsy: true }).isString(),
    body('observacoes').optional({ nullable: true, checkFalsy: true }).isString(),
  ],
  validateRequest,
  bancoDefeitosController.create
);

/**
 * @swagger
 * /api/banco-defeitos/{id}:
 *   put:
 *     tags: [Banco de Defeitos]
 *     summary: Atualiza um registro do banco de defeitos
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
 *             $ref: '#/components/schemas/BancoDefeitosInput'
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 */
router.put(
  '/:id',
  verifyToken,
  [
    body('marca').optional().trim().notEmpty().withMessage('Marca não pode ser vazia.'),
    body('modelo').optional().trim().notEmpty().withMessage('Modelo não pode ser vazio.'),
    body('categoria').optional().isIn(CATEGORIAS_VALIDAS).withMessage('Categoria inválida.'),
  ],
  validateRequest,
  bancoDefeitosController.update
);

/**
 * @swagger
 * /api/banco-defeitos/{id}:
 *   delete:
 *     tags: [Banco de Defeitos]
 *     summary: Exclui um registro do banco de defeitos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro excluído com sucesso
 */
router.delete('/:id', verifyToken, bancoDefeitosController.delete);

module.exports = router;
