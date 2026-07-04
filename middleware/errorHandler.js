const BusinessError = require('../error/BusinessError');
const NotFoundError = require('../error/exception/NotFound');
const TechnicalError = require('../error/TechnicalError');

const errorHandler = (err, req, res, next) => {
  
  const formatError = (error) => ({
    status: error.status?.toString() || '500',
    source: error.source ? { pointer: error.source.pointer } : undefined,
    title: error.title || 'Error',
    detail: error.detail || error.message,
    code: error.code
  });

  const sendErrorResponse = (statusCode, errors) => {
    return res.status(statusCode).json({ errors });
  };

 
  if (err.statusCode && err.details && Array.isArray(err.details)) {
    const errors = err.details.map(detail => ({
      status: err.statusCode.toString(),
      source: { pointer: `/data/attributes/${detail.path.join('/')}` },
      title: 'Validation Error',
      detail: detail.message
    }));
    return sendErrorResponse(err.statusCode, errors);
  }


  if ((err instanceof BusinessError || err instanceof NotFoundError) && 
      err.errors && Array.isArray(err.errors)) {
    const errors = err.errors.map(formatError);
    return sendErrorResponse(err.statusCode || 500, errors);
  }

  if (err instanceof NotFoundError) {
    const errors = [formatError({
      status: (err.statusCode || 404).toString(),
      title: 'Not Found',
      detail: err.message,
      code: 'NOT_FOUND'
    })];
    return sendErrorResponse(err.statusCode || 404, errors);
  }

  if (err instanceof TechnicalError) {
    const errors = [formatError({
      status: err.status,
      title: err.title,
      detail: err.detail,
      code: err.code,
      source: err.source
    })];
    return sendErrorResponse(parseInt(err.status) || 500, errors);
  }

  // Handle Sequelize/Database errors
  if (err.name === 'SequelizeDatabaseError' || err.parent) {
    const dbError = err.parent || err;
    const errorDetail = dbError.message || err.message;
    const hint = dbError.hint ? ` Hint: ${dbError.hint}` : '';
    
    const errors = [formatError({
      status: '500',
      title: 'Database Error',
      detail: `${errorDetail}${hint}`,
      code: err.parent?.code || 'DATABASE_ERROR'
    })];
    return sendErrorResponse(500, errors);
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors?.map(e => formatError({
      status: '400',
      title: 'Validation Error',
      detail: e.message,
      code: 'VALIDATION_ERROR'
    })) || [formatError({
      status: '400',
      title: 'Validation Error',
      detail: err.message,
      code: 'VALIDATION_ERROR'
    })];
    return sendErrorResponse(400, errors);
  }

  // Handle other known error types with their actual message
  const defaultError = formatError({
    status: '500',
    title: 'Internal Server Error',
    detail: err.message || 'An unexpected error occurred on the server.',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
  return sendErrorResponse(500, [defaultError]);
};

module.exports = errorHandler;
