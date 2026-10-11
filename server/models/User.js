/**
 * server/models/User.js
 *
 * Mongoose Schema for User Profiles and Preferences
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    password: { type: String },
    role: { type: String, default: 'Software Engineer' },
    level: { type: String, default: 'Mid-Level' },
    language: { type: String, default: 'English' },
    difficulty: { type: String, default: 'Medium' },
    bio: { type: String, default: '' },
    targetCompanies: { type: String, default: '' },
    location: { type: String, default: '' },
    voiceEnabled: { type: Boolean, default: true },
    speechSpeed: { type: String, default: 'Normal' },
    micSensitivity: { type: String, default: 'Normal' },
    autoSilence: { type: Boolean, default: true },
    saveRecordings: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
