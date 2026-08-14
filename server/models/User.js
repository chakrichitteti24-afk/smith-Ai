/**
 * server/models/User.js
 *
 * Mongoose Schema for User Profiles and Preferences
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Alex Morgan' },
    email: { type: String, trim: true, lowercase: true, index: true },
    role: { type: String, default: 'Software Engineer' },
    level: { type: String, default: 'Fresher' },
    language: { type: String, default: 'English' },
    difficulty: { type: String, default: 'Beginner' },
    voiceEnabled: { type: Boolean, default: true },
    speechSpeed: { type: String, default: 'Normal' },
    micSensitivity: { type: String, default: 'Normal' },
    autoSilence: { type: Boolean, default: true },
    saveRecordings: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
