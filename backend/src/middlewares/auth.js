const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/database');
const apiResponse = require('../utils/apiResponse');

/**
 * Middleware que verifica o token JWT no header Authorization
 */
const verifyToken = async (req, res, next) => {
  try {
    // ESPIÃO NO BACKEND:
    console.log(`\n=== 🚨 MIDDLEWARE DE AUTH ===`);
    console.log(`Rota acessada: ${req.method} ${req.originalUrl}`);
    console.log(`Header recebido:`, req.headers.authorization);

    // VACINA ANTI-CORS: Libera requisições de preflight sem pedir token
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Bloqueado: Header não chegou ou está mal formatado.');
      return apiResponse.error(res, 'Token de acesso não fornecido.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Validação defensiva: garante que o ID existe no payload
    if (!decoded.id) {
      return apiResponse.error(res, 'Payload do token inválido.', 401);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
    });

    if (!usuario) {
      return apiResponse.error(res, 'Usuário não encontrado.', 401);
    }

    if (!usuario.ativo) {
      return apiResponse.error(res, 'Usuário desativado. Entre em contato com o administrador.', 403);
    }

    req.user = usuario;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return apiResponse.error(res, 'Token expirado. Faça login novamente.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return apiResponse.error(res, 'Token inválido.', 401);
    }
    return apiResponse.error(res, 'Erro na autenticação.', 500);
  }
};

/**
 * Middleware que verifica se o usuário possui uma das roles permitidas
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, 'Usuário não autenticado.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return apiResponse.error(res, 'Você não tem permissão para acessar este recurso.', 403);
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.id) {
      req.user = null;
      return next();
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
    });

    req.user = usuario && usuario.ativo ? usuario : null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};