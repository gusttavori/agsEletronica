const prisma = require('../config/database');

const usuarioRepository = {
  /**
   * Busca usuário por email
   */
  findByEmail: async (email) => {
    return prisma.usuario.findUnique({
      where: { email },
    });
  },

  /**
   * Busca usuário por ID
   */
  findById: async (id) => {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Cria um novo usuário
   */
  create: async (data) => {
    return prisma.usuario.create({
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    });
  },

  /**
   * Atualiza um usuário
   */
  update: async (id, data) => {
    return prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Atualiza o refresh token do usuário
   */
  updateRefreshToken: async (id, token) => {
    return prisma.usuario.update({
      where: { id },
      data: { refreshToken: token },
    });
  },
};

module.exports = usuarioRepository;
