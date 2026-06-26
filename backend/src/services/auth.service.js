const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usuarioRepository = require('../repositories/usuario.repository');
const { AppError } = require('../middlewares/errorHandler');

const authService = {
  /**
   * Autentica um usuário com email e senha
   */
  authenticate: async (email, senha) => {
    const usuario = await usuarioRepository.findByEmail(email);

    if (!usuario) {
      throw new AppError('Email ou senha inválidos.', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário desativado. Entre em contato com o administrador.', 403);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new AppError('Email ou senha inválidos.', 401);
    }

    const tokens = authService.generateTokens(usuario);

    await usuarioRepository.updateRefreshToken(
      usuario.id,
      tokens.refreshToken
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    };
  },

  /**
   * Renova tokens usando refresh token
   */
  refreshTokens: async (refreshToken) => {
    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AppError('Refresh token inválido ou expirado.', 401);
    }

    const usuario = await usuarioRepository.findByEmail(decoded.email);

    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário desativado.', 403);
    }

    if (usuario.refreshToken !== refreshToken) {
      throw new AppError('Refresh token inválido ou já utilizado.', 401);
    }

    const tokens = authService.generateTokens(usuario);

    await usuarioRepository.updateRefreshToken(
      usuario.id,
      tokens.refreshToken
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    };
  },

  /**
   * Realiza logout do usuário
   */
  logout: async (userId) => {
    await usuarioRepository.updateRefreshToken(userId, null);
  },

  /**
   * Gera par de tokens JWT (access + refresh)
   */
  generateTokens: (usuario) => {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  },
};

module.exports = authService;