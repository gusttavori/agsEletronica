const apiResponse = require('../utils/apiResponse');

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, _next) => {
  console.error('[ERROR]', err);

  if (err.name === 'PrismaClientKnownRequestError' || err.code) {
    return handlePrismaError(err, res);
  }

  if (err.name === 'ValidationError') {
    return apiResponse.error(res, 'Dados inválidos.', 422, err.errors);
  }

  if (err.name === 'MulterError') {
    return handleMulterError(err, res);
  }

  if (err.statusCode) {
    return apiResponse.error(res, err.message, err.statusCode, err.errors || null);
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500
    ? 'Erro interno do servidor. Tente novamente mais tarde.'
    : err.message;

  return apiResponse.error(res, message, statusCode);
};

/**
 * Trata erros específicos do Prisma
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002': {
      const field = err.meta?.target?.join(', ') || 'campo';
      return apiResponse.error(res, `Já existe um registro com este ${field}. O valor deve ser único.`, 409);
    }
    case 'P2003': {
      return apiResponse.error(res, 'Referência inválida. O registro relacionado não existe.', 400);
    }
    case 'P2025': {
      return apiResponse.error(res, 'Registro não encontrado.', 404);
    }
    case 'P2014': {
      return apiResponse.error(res, 'Não é possível excluir este registro pois existem registros relacionados.', 409);
    }
    default: {
      return apiResponse.error(res, 'Erro no banco de dados. Tente novamente.', 500);
    }
  }
};

/**
 * Trata erros do Multer (upload)
 */
const handleMulterError = (err, res) => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return apiResponse.error(res, 'O arquivo excede o tamanho máximo permitido (10MB).', 413);
    case 'LIMIT_FILE_COUNT':
      return apiResponse.error(res, 'Número máximo de arquivos excedido.', 413);
    case 'LIMIT_UNEXPECTED_FILE':
      return apiResponse.error(res, 'Campo de arquivo inesperado.', 400);
    default:
      return apiResponse.error(res, 'Erro no upload do arquivo.', 500);
  }
};

/**
 * Cria um erro com status code customizado
 */
class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }
}

module.exports = {
  errorHandler,
  AppError,
};
