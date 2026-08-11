/**
 * rateLimiter.js — Smith AI
 *
 * Lightweight, zero-dependency sliding-window IP rate limiter middleware
 * designed to support 1000+ concurrent users while preventing API abuse & DoS attacks.
 */

'use strict';

const rateLimitMap = new Map();

// Periodic cleanup of stale IP records every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.resetTime > 0) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref(); // unref so it doesn't block process shutdown

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 1 minute)
 * @param {number} options.maxRequests - Max allowed requests per window (default 120)
 */
function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 120 } = {}) {
  return function rateLimiter(req, res, next) {
    // Determine client IP (handles x-forwarded-for headers from proxies/load balancers)
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(ip, record);
    } else {
      record.count += 1;
    }

    // Set standard rate limit HTTP headers
    const remaining = Math.max(0, maxRequests - record.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      return res.status(429).json({
        ok: false,
        error: {
          message: 'Too many requests. Please slow down and try again shortly.',
          status: 429,
        },
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
