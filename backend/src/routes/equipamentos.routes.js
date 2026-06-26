const { Router } = require('express');
const { body } = require('express-validator');
const equipamentoController = require('../controllers/equipamento.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');
const upload = require('../middlewares/upload'); // <-- Importando o Multer

const router = Router();

const CATEGORIAS_VALIDAS = ['TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'];

router.get('/', verifyToken, equipamentoController.list);
router.get('/:id', verifyToken, equipamentoController.getById);

router.post(
  '/',
  verifyToken,
  [
    body('clienteId').isInt({ min: 1 }).withMessage('ID do cliente é obrigatório.'),
    body('categoria').isIn(CATEGORIAS_VALIDAS).withMessage('Categoria inválida.'),
    body('marca').trim().notEmpty().withMessage('Marca é obrigatória.'),
    body('modelo').trim().notEmpty().withMessage('Modelo é obrigatório.'),
    body('numeroSerie').optional({ nullable: true, checkFalsy: true }).isString(),
    body('observacoes').optional({ nullable: true, checkFalsy: true }).isString(),
  ],
  validateRequest,
  equipamentoController.create
);

router.put(
  '/:id',
  verifyToken,
  [
    body('categoria').optional().isIn(CATEGORIAS_VALIDAS).withMessage('Categoria inválida.'),
    body('marca').optional().trim().notEmpty().withMessage('Marca não pode ser vazia.'),
    body('modelo').optional().trim().notEmpty().withMessage('Modelo não pode ser vazio.'),
  ],
  validateRequest,
  equipamentoController.update
);

router.delete('/:id', verifyToken, equipamentoController.delete);

// --- NOVAS ROTAS DE FOTOS ---
// Upload de foto vinculada ao equipamento
router.post(
  '/:id/fotos',
  verifyToken,
  upload.single('foto'), // Espera um arquivo com a chave 'foto'
  equipamentoController.uploadFoto
);

// Exclusão de foto
router.delete(
  '/:equipamentoId/fotos/:fotoId',
  verifyToken,
  equipamentoController.deleteFoto
);

module.exports = router;