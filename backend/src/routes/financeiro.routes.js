const { Router } = require('express');
const { getRelatorio } = require('../controllers/financeiro.controller');

const router = Router();

router.get('/', getRelatorio);

module.exports = router;