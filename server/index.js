/**
 * Smith AI — Backend Entry Point
 *
 * Express + WebSocket server.
 * Port: 3001
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express   = require('express');
const cors      = require('cors');
const mongoose  = require('mongoose');
const { createServer } = require('http');

const { requestLogger, logger }  = require('./middleware/logger');
const { errorHandler }           = require('./middleware/errorHandler');
const helmet                    = require('helmet');
const { connectDB }              = require('./config/db');
const { mongoSanitize }          = require('./middleware/sanitizer');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const interviewRoutes            = require('./routes/interviewRoutes');
const practiceRoutes             = require('./routes/practiceRoutes');
const authRoutes                 = require('./routes/authRoutes');

const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 3001;

// OWASP A05: Security Misconfiguration — Disable Express signature header
app.disable('x-powered-by');

// OWASP A05: Helmet Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Managed by client/Vercel headers
}));

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
      ((process.env.NODE_ENV || 'development') !== 'production' && cleanOrigin.toLowerCase().startsWith('http://localhost:')) ||
      cleanOrigin.endsWith('.vercel.app');

    if (isAllowed) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400,
}));

// OWASP A08 & A03: Strict Body Parsers & NoSQL Injection Sanitization
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(mongoSanitize);
app.use(requestLogger);

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

// OWASP A04/A07: Dedicated Auth Rate Limiting vs General API Rate Limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/interview', apiLimiter, interviewRoutes);
app.use('/api/practice', apiLimiter, practiceRoutes);

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

  return new Promise((resolve, reject) => {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info('server_started', { port: PORT, env: process.env.NODE_ENV });
      resolve(server);
    });
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.info('server_already_listening', { port: PORT });
        resolve(server);
      } else {
        reject(err);
      }
    });
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
