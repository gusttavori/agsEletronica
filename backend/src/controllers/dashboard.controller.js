const dashboardService = require('../services/dashboard.service');
const apiResponse = require('../utils/apiResponse');

const dashboardController = {
  /**
   * GET /api/dashboard/stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await dashboardService.getStats();
      return apiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/charts
   */
  getChartData: async (req, res, next) => {
    try {
      const charts = await dashboardService.getChartData();
      return apiResponse.success(res, charts);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
