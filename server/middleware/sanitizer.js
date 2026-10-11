/**
 * sanitizer.js — Smith AI
 *
 * OWASP A03: Injection Prevention (NoSQL Injection & Parameter Pollution)
 * Recursively sanitizes request body, query, and params by stripping or blocking
 * MongoDB operators (keys starting with $) and prohibited characters.
 */

'use strict';

function hasMongoOperators(obj) {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }
    if (typeof obj[key] === 'object' && hasMongoOperators(obj[key])) {
      return true;
    }
  }
  return false;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys with leading $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Express middleware to sanitize incoming request data against NoSQL injection
 */
function mongoSanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    if (hasMongoOperators(req.body)) {
      req.body = sanitizeObject(req.body);
    }
  }
  if (req.query && typeof req.query === 'object') {
    if (hasMongoOperators(req.query)) {
      req.query = sanitizeObject(req.query);
    }
  }
  if (req.params && typeof req.params === 'object') {
    if (hasMongoOperators(req.params)) {
      req.params = sanitizeObject(req.params);
    }
  }
  next();
}

module.exports = { mongoSanitize, hasMongoOperators, sanitizeObject };
