/**
 * Smith AI — Backend Entry Point
 *
 * Express + WebSocket server.
 * Port: 3001
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
const { createServer } = require('http');

const { requestLogger, logger }  = require('./middleware/logger');
const { errorHandler }           = require('./middleware/errorHandler');
const { connectDB }              = require('./config/db');
const interviewRoutes            = require('./routes/interviewRoutes');

const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CLIENT_ORIGINS = ['http://localhost:5173', 'https://smith-ai-five.vercel.app'];
const rawOrigins = [...DEFAULT_CLIENT_ORIGINS];
if (process.env.CLIENT_ORIGIN) rawOrigins.push(process.env.CLIENT_ORIGIN);
if (process.env.CLIENT_ORIGINS) {
  process.env.CLIENT_ORIGINS.split(',').forEach(s => rawOrigins.push(s.trim()));
}
const allowedOrigins = rawOrigins.map(o => o.trim().replace(/\/+$/, '')).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    const isAllowed = allowedOrigins.some(o => o.toLowerCase() === cleanOrigin.toLowerCase()) ||
      ((process.env.NODE_ENV || 'development') !== 'production' && cleanOrigin.toLowerCase().startsWith('http://localhost:'));

    if (isAllowed) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400,
}));

const { createRateLimiter } = require('./middleware/rateLimiter');

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

const apiLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 120 });

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    ts: new Date().toISOString(),
    database: dbStateMap[mongoose.connection.readyState] || 'unknown',
  });
});

app.use('/api/interview', apiLimiter, interviewRoutes);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: { message: 'Route not found' } });
});

// Central error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  server.keepAliveTimeout = 65000;
  server.headersTimeout   = 66000;

  // Connect to MongoDB
  await connectDB();

  server.listen(PORT, () => {
    logger.info('server_started', { port: PORT, env: process.env.NODE_ENV });
  });
}

function shutdown(signal) {
  logger.info('shutdown', { signal });
  server.close(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    logger.info('server_closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('uncaught_exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', { reason: String(reason) });
});

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
