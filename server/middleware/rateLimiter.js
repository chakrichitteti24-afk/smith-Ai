/**
 * rateLimiter.js — Smith AI
 *
 * OWASP A04 & A07: Brute-Force & Denial-of-Service Defense
 * Sliding-window rate limiting middleware with instance-isolated memory stores
 * and standard rate-limiting HTTP headers.
 */

'use strict';

/**
 * Creates a rate limiter middleware with an isolated storage map
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 1 minute)
 * @param {number} options.maxRequests - Max allowed requests per window (default 120)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
function createRateLimiter({
  windowMs = 60 * 1000,
  maxRequests = 120,
  message = 'Too many requests. Please slow down and try again shortly.'
} = {}) {
  const store = new Map();

  // Periodic cleanup of stale IP records
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip);
      }
    }
  }, Math.max(30000, Math.floor(windowMs / 2)));

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimiter(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = store.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        ok: false,
        error: {
          message,
          status: 429,
          retryAfter: retryAfterSec,
        },
      });
    }

    next();
  };
}

// Pre-configured rate limiters
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded. Please wait a moment before sending more requests.',
});

// Stricter rate limiter for authentication routes (login / register) to prevent brute-force attacks
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,           // 20 attempts per 15 minutes per IP
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
};
