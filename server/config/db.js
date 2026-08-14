/**
 * server/config/db.js
 *
 * Mongoose Database Connection Module for Smith AI Backend
 */

'use strict';

const mongoose = require('mongoose');
const { logger } = require('../middleware/logger');

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    logger.warn('mongodb_uri_missing', { message: 'MONGODB_URI not set in environment variables.' });
    return false;
  }

  if (mongoURI.includes('<db_username>')) {
    logger.warn('mongodb_username_placeholder', { message: 'Please replace <db_username> with your actual MongoDB username in .env' });
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('mongodb_connected', { host: conn.connection.host, name: conn.connection.name });
    console.log(`\x1b[32m[MongoDB]\x1b[0m Connected to ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    logger.error('mongodb_connection_failed', { message: err.message });
    console.error(`\x1b[31m[MongoDB Connection Error]\x1b[0m ${err.message}`);
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('mongodb_disconnected', { message: 'MongoDB connection lost' });
});

module.exports = { connectDB };
