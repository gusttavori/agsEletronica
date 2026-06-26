const { Router } = require('express');
const globalSearchController = require('../controllers/globalSearch.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Busca Global]
 *     summary: Busca global em todas as entidades
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca (mínimo 2 caracteres)
 *     responses:
 *       200:
 *         description: Resultados da busca agrupados por entidade
 *       400:
 *         description: Termo de busca muito curto
 */
router.get('/', verifyToken, globalSearchController.search);

module.exports = router;
