const globalSearchService = require('../services/globalSearch.service');
const apiResponse = require('../utils/apiResponse');

const globalSearchController = {
  /**
   * GET /api/search?q=termo
   */
  search: async (req, res, next) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return apiResponse.error(res, 'O termo de busca deve ter pelo menos 2 caracteres.', 400);
      }

      const results = await globalSearchService.search(q);
      return apiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = globalSearchController;
