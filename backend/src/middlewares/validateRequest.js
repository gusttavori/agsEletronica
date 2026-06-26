const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      campo: err.path,
      mensagem: err.msg,
      valor: err.value,
    }));

    return apiResponse.error(
      res,
      'Dados de entrada inválidos. Verifique os campos e tente novamente.',
      422,
      formattedErrors
    );
  }

  next();
};

module.exports = validateRequest;