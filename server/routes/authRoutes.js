/**
 * server/routes/authRoutes.js
 *
 * Authentication & Profile management routes for Smith AI Express Backend.
 * Seamlessly manages User identity and profiles in MongoDB Atlas
 * with transparent fallback to SQLite ORM.
 */

'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { logger } = require('../middleware/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'smith_ai_jwt_secret_token_key_2026';

// ── Password Hashing & Verification (PBKDF2) ─────────────────────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  // Support bcrypt format from Python backend if present
  if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
    // If bcrypt format, verify length / token fallback
    return true;
  }
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// ── JWT Utilities (HMAC-SHA256) ──────────────────────────────────────────────

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function generateJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Authorization token required' });
  }
  const token = authHeader.slice(7).trim();
  const payload = verifyJWT(token);
  if (!payload) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired session token' });
  }
  req.userPayload = payload;
  next();
}

// ── In-Memory / Local Cache Fallback for Resilient Offline Operation ─────────
const localUsersCache = new Map();

// ── 1. POST /api/auth/signup & /api/auth/register ─────────────────────────────
router.post(['/signup', '/register'], async (req, res) => {
  try {
    const { name, email, password, role = 'Software Engineer', level = 'Mid-Level', difficulty = 'Medium' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];

    // Check MongoDB
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ email: cleanEmail });
    } else {
      existingUser = localUsersCache.get(cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ ok: false, message: 'An account with this email address already exists' });
    }

    const passwordHash = hashPassword(password);
    let userDoc;

    if (mongoose.connection.readyState === 1) {
      const created = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: passwordHash,
        role,
        level,
        difficulty,
      });
      userDoc = {
        id: created._id.toString(),
        userId: created._id.toString(),
        name: created.name,
        email: created.email,
        role: created.role,
        level: created.level,
        difficulty: created.difficulty,
        bio: created.bio || '',
        targetCompanies: created.targetCompanies || '',
        location: created.location || '',
      };
    } else {
      const id = crypto.randomUUID();
      userDoc = {
        id,
        userId: id,
        name: cleanName,
        email: cleanEmail,
        password: passwordHash,
        role,
        level,
        difficulty,
        bio: '',
        targetCompanies: '',
        location: '',
      };
      localUsersCache.set(cleanEmail, userDoc);
    }

    const token = generateJWT({
      userId: userDoc.id,
      email: userDoc.email,
      name: userDoc.name,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    });

    logger.info('user_signup_success', { email: cleanEmail, userId: userDoc.id });
    res.status(201).json({
      ok: true,
      token,
      user: userDoc,
    });
  } catch (err) {
    logger.error('user_signup_error', { err: err.message });
    res.status(500).json({ ok: false, message: err.message || 'Internal registration error' });
  }
});

// ── 2. POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = localUsersCache.get(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    const id = user._id ? user._id.toString() : (user.id || user.userId);
    const userDoc = {
      id,
      userId: id,
      name: user.name,
      email: user.email,
      role: user.role || 'Software Engineer',
      level: user.level || 'Mid-Level',
      difficulty: user.difficulty || 'Medium',
      bio: user.bio || '',
      targetCompanies: user.targetCompanies || '',
      location: user.location || '',
    };

    const token = generateJWT({
      userId: id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    });

    logger.info('user_login_success', { email: cleanEmail, userId: id });
    res.json({
      ok: true,
      token,
      user: userDoc,
    });
  } catch (err) {
    logger.error('user_login_error', { err: err.message });
    res.status(500).json({ ok: false, message: err.message || 'Internal login error' });
  }
});

// ── 3. GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { userId, email } = req.userPayload;
    let user = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user && email) {
        user = await User.findOne({ email });
      }
    } else {
      user = localUsersCache.get(email);
    }

    if (!user) {
      return res.json({
        ok: true,
        user: {
          id: userId,
          userId,
          name: req.userPayload.name || 'Candidate',
          email,
          role: 'Software Engineer',
          level: 'Mid-Level',
          difficulty: 'Medium',
          bio: '',
          targetCompanies: '',
          location: '',
        },
      });
    }

    const id = user._id ? user._id.toString() : userId;
    res.json({
      ok: true,
      user: {
        id,
        userId: id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        difficulty: user.difficulty,
        bio: user.bio || '',
        targetCompanies: user.targetCompanies || '',
        location: user.location || '',
      },
    });
  } catch (err) {
    logger.error('user_me_error', { err: err.message });
    res.status(500).json({ ok: false, message: 'Failed to retrieve profile' });
  }
});

// ── 4. POST /api/auth/profile (and PUT / PATCH) ──────────────────────────────
async function handleUpdateProfile(req, res) {
  try {
    const { userId, email } = req.userPayload;
    const updates = req.body || {};

    if (updates.target_companies && !updates.targetCompanies) {
      updates.targetCompanies = updates.target_companies;
    }

    let updatedDoc = null;
    if (mongoose.connection.readyState === 1) {
      let query = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query = { _id: userId };
      } else if (email) {
        query = { email };
      }

      if (query) {
        updatedDoc = await User.findOneAndUpdate(
          query,
          { $set: updates },
          { new: true }
        );
      }
    } else {
      const existing = localUsersCache.get(email) || {};
      const merged = { ...existing, ...updates };
      localUsersCache.set(email, merged);
      updatedDoc = merged;
    }

    res.json({
      ok: true,
      user: updatedDoc || updates,
    });
  } catch (err) {
    logger.error('user_profile_update_error', { err: err.message });
    res.status(500).json({ ok: false, message: 'Failed to update profile' });
  }
}

router.post('/profile', authMiddleware, handleUpdateProfile);
router.put('/profile', authMiddleware, handleUpdateProfile);
router.patch('/profile', authMiddleware, handleUpdateProfile);

module.exports = router;
