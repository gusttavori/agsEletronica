/**
 * Constrói parâmetros de paginação para o Prisma
 * @param {Object} query - Query params da requisição (page, limit)
 * @returns {Object} { skip, take, page, limit }
 */
const buildPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

/**
 * Constrói metadados de paginação para a resposta
 * @param {number} total - Total de registros
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @returns {Object} meta de paginação
 */
const buildPaginationMeta = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  buildPagination,
  buildPaginationMeta,
};
