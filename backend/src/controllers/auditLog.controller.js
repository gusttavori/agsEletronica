const auditLogRepository = require('../repositories/auditLog.repository');
const apiResponse = require('../utils/apiResponse');
const { buildPagination, buildPaginationMeta } = require('../utils/pagination');

const auditLogController = {
  /**
   * GET /api/audit-logs
   */
  list: async (req, res, next) => {
    try {
      const pagination = buildPagination(req.query);
      const filters = {
        entidade: req.query.entidade,
        acao: req.query.acao,
        usuarioId: req.query.usuarioId,
        entidadeId: req.query.entidadeId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
      };

      const [data, total] = await Promise.all([
        auditLogRepository.findAll(filters, pagination),
        auditLogRepository.count(filters),
      ]);

      return apiResponse.success(
        res,
        data,
        buildPaginationMeta(total, pagination.page, pagination.limit)
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = auditLogController;
