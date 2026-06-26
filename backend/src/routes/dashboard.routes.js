const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna estatísticas gerais do sistema
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */
router.get('/stats', verifyToken, dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/charts:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna dados para os gráficos
 *     responses:
 *       200:
 *         description: Dados dos gráficos
 */
router.get('/charts', verifyToken, dashboardController.getChartData);

module.exports = router;
