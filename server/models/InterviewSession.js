/**
 * server/models/InterviewSession.js
 *
 * Mongoose Schema for Saved Interview Sessions and Reports
 */

const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, required: true },
    level: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString() },
    score: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    confidence: { type: Number, default: null },
    logicalThinking: { type: Number, default: null },
    result: { type: String, default: 'Borderline' },
    qaEvaluations: { type: Array, default: [] },
    codingSubmissions: { type: Array, default: [] },
    analysis: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
