const { logger } = require('./logger');

/**
 * Centralised error handler.
 * Always returns structured JSON — never crashes silently.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const reqId  = req.reqId || 'unknown';

  logger.error('unhandled_error', {
    reqId,
    status,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(status).json({
    ok: false,
    error: {
      message: err.message || 'Internal server error',
      reqId,
    },
  });
}

module.exports = { errorHandler };
