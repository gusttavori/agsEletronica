/**
 * Resposta de sucesso padrão
 */
const success = (res, data, meta = null, statusCode = 200) => {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Resposta de sucesso com paginação
 */
const paginated = (res, data, total, page, limit, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * Resposta de erro padrão
 */
const error = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Resposta de criação (201)
 */
const created = (res, data) => {
  return success(res, data, null, 201);
};

/**
 * Resposta sem conteúdo (204)
 */
const noContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  success,
  paginated,
  error,
  created,
  noContent,
};
