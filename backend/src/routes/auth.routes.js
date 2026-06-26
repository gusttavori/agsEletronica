const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realiza login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').notEmpty().withMessage('Senha é obrigatória.'),
  ],
  validateRequest,
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Autenticação]
 *     summary: Renova token de acesso
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *       401:
 *         description: Refresh token inválido
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token é obrigatório.'),
  ],
  validateRequest,
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realiza logout
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Autenticação]
 *     summary: Retorna dados do usuário autenticado
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/me', verifyToken, authController.me);

module.exports = router;
