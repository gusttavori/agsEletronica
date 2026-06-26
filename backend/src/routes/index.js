const { Router } = require('express');

const authRoutes = require('./auth.routes');
const clientesRoutes = require('./clientes.routes');
const equipamentosRoutes = require('./equipamentos.routes');
const ordensServicoRoutes = require('./ordensServico.routes');
const financeiroRoutes = require('./financeiro.routes');
const bancoDefeitosRoutes = require('./bancoDefeitos.routes');
const dashboardRoutes = require('./dashboard.routes');
const orcamentoRoutes = require('./orcamento.routes');
const uploadRoutes = require('./upload.routes');
const globalSearchRoutes = require('./globalSearch.routes');
const auditLogRoutes = require('./auditLog.routes');

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/clientes', clientesRoutes);
router.use('/equipamentos', equipamentosRoutes);
router.use('/ordens-servico', ordensServicoRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/banco-defeitos', bancoDefeitosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/orcamento', orcamentoRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', globalSearchRoutes);
router.use('/audit-logs', auditLogRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

module.exports = router;
