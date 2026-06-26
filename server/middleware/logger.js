const { randomUUID } = require('crypto');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = process.env.NODE_ENV === 'production' ? 1 : 3;

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] > currentLevel) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...meta,
  };
  const out = JSON.stringify(entry);
  if (level === 'error') return console.error(out);
  console.log(out);
}

const logger = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

/** Express request logger middleware */
function requestLogger(req, res, next) {
  // Use client-provided request ID if available, otherwise generate one
  const reqId = req.headers['x-request-id'] || (randomUUID ? randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));
  req.reqId = reqId;
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
}

module.exports = { logger, requestLogger };
