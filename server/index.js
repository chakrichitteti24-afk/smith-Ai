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
const { createServer } = require('http');

const { requestLogger, logger }  = require('./middleware/logger');
const { errorHandler }           = require('./middleware/errorHandler');
const interviewRoutes            = require('./routes/interviewRoutes');

const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Configure CORS: allow one or more client origins (use env var or sensible defaults)
const DEFAULT_CLIENT_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = (process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map(s => s.trim())
  : DEFAULT_CLIENT_ORIGINS
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);

    // Exact match against allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // In development, allow any localhost origin to simplify running on different dev ports
    if ((process.env.NODE_ENV || 'development') !== 'production' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/interview', interviewRoutes);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: { message: 'Route not found' } });
});

// Central error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────

function startServer() {
  server.listen(PORT, () => {
    logger.info('server_started', { port: PORT, env: process.env.NODE_ENV });
  });
}

// Graceful shutdown
function shutdown(signal) {
  logger.info('shutdown', { signal });
  server.close(() => {
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

// If run directly, start the server. When required (for tests), do not auto-start.
if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
