const { logger } = require('./logger');

/**
 * Centralised error handler.
 * OWASP A05: Security Misconfiguration Prevention.
 * Sanitizes error messages in production to prevent stack trace or database error leakage.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isMulterError = err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE';
  const status = isMulterError ? 400 : (err.status || err.statusCode || 500);
  const reqId  = req.reqId || 'unknown';
  const isProd = process.env.NODE_ENV === 'production';

  // Always log full error server-side for observability
  logger.error('unhandled_error', {
    reqId,
    status,
    message: err.message,
    stack: !isProd ? err.stack : undefined,
  });

  // Client-facing error message sanitization
  let clientMessage = err.message || 'Internal server error';
  if (status >= 500 && isProd) {
    clientMessage = 'An internal server error occurred. Please try again later.';
  }

  res.status(status).json({
    ok: false,
    error: {
      message: clientMessage,
      reqId,
    },
  });
}

module.exports = { errorHandler };
