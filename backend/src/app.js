const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const setupSwagger = require('./config/swagger');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost'
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Arquivos estáticos (uploads) ──────────────────────────────────────
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// ─── Swagger API Docs ──────────────────────────────────────────────────
setupSwagger(app);

// ─── Rotas da API ──────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Rota raiz ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'AGS Eletrônica - API',
      version: '1.0.0',
      docs: '/api-docs',
      health: '/api/health',
    },
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
