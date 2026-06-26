const authService = require('../services/auth.service');
const apiResponse = require('../utils/apiResponse');

const authController = {
  /**
   * POST /api/auth/login
   */
login: async (req, res, next) => {
  try {
    console.log('BODY:', req.body);

    const { email, senha } = req.body;

    const result = await authService.authenticate(email, senha);

    console.log('RESULT:', result);

    return apiResponse.success(res, result);
  } catch (error) {
    console.error('LOGIN ERROR');
    console.error(error);
    console.error(error.stack);

    next(error);
  }
},

  /**
   * POST /api/auth/refresh
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      return apiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (req, res, next) => {
    try {
      await authService.logout(req.user.id);
      return apiResponse.success(res, { message: 'Logout realizado com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  me: async (req, res, next) => {
    try {
      return apiResponse.success(res, { user: req.user });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
