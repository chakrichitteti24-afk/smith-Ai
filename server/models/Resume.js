/**
 * server/models/Resume.js
 *
 * Mongoose Schema for Parsed Resume Intelligence
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '' },
    uploadDate: { type: Date, default: Date.now },
    atsScore: { type: Number, default: 0 },
    skills: [{ type: String }],
    experience: [{ type: Object }],
    projects: [{ type: Object }],
    missingKeywords: [{ type: String }],
    recommendations: [{ type: String }],
    rawAnalysis: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
