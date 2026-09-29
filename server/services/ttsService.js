/**
 * server/services/ttsService.js
 *
 * Ultra-high-fidelity Neural Text-To-Speech (TTS) Service for Smith AI.
 * Powered by Microsoft Edge Neural Voices — 100% human-grade, natural intonation,
 * zero robotic synthesis artifacts.
 */

'use strict';

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { logger } = require('../middleware/logger');

// Curated studio-quality neural voices
const CURATED_VOICES = [
  { id: 'en-US-ChristopherNeural', name: 'Smith (Executive Male)', gender: 'Male', accent: 'US', desc: 'Authoritative, calm, executive tech interviewer' },
  { id: 'en-US-BrianNeural', name: 'Smith (Conversational Male)', gender: 'Male', accent: 'US', desc: 'Warm, natural tech lead tone' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (Energetic Male)', gender: 'Male', accent: 'US', desc: 'Crisp, modern, approachable' },
  { id: 'en-US-AvaNeural', name: 'Sarah (Executive Female)', gender: 'Female', accent: 'US', desc: 'Articulate, confident, senior interviewer' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Friendly Female)', gender: 'Female', accent: 'US', desc: 'Warm, engaging, conversational' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (British Male)', gender: 'Male', accent: 'UK', desc: 'Formal, articulate British accent' },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat (Indian Male)', gender: 'Male', accent: 'IN', desc: 'Clear, professional Indian English' },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja (Indian Female)', gender: 'Female', accent: 'IN', desc: 'Expressive, pleasant Indian English' }
];

const DEFAULT_VOICE = 'en-US-ChristopherNeural';

// In-memory buffer cache for repeated statements (e.g. standard intros, common transitions)
const cache = new Map();
const MAX_CACHE_ITEMS = 80;

/**
 * Shapes conversational text with human speech gaps, micro-pauses, and breath rhythms.
 * Neural TTS models naturally interpret punctuation:
 * - "..." creates an authentic thinking pause / vocal pitch drop
 * - " — " creates an expressive phrase pause
 * - Conversational interjections ("Hmm...", "Right...") get natural hesitation pauses
 */
function humanizeConversationalCadence(rawText) {
  if (!rawText) return '';
  let text = rawText;

  // 1. Natural thinking pauses on conversational reflections / filler sounds
  text = text.replace(/^(Hmm|Right|Got it|I see|Alright|Interesting|Fair enough|Okay|Understood|Well)([.,!]?)\s*/i, (match, word) => {
    return `${word}... `;
  });

  // 2. Add breathing pauses to transitional discourse markers
  text = text.replace(/\b(Now|Moving on|Let's move on|Looking at this|To dive deeper|In that case)([.,]?)\s*/gi, (match, phrase) => {
    return `${phrase}... `;
  });

  // 3. Ensure a thoughtful hesitation gap between acknowledgment and the actual question
  text = text.replace(/([.?!])\s+([A-Z])/g, '$1 ... $2');

  // 4. Normalize multiple periods and spaces
  text = text.replace(/\.{4,}/g, '...');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Clean and prepare text for human-sounding neural TTS.
 * Strips markdown, code blocks, excessive symbols, applies human pauses, and escapes XML for SSML.
 */
function cleanTextForTTS(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText
    .replace(/```[\s\S]*?```/g, ' [code challenge omitted for audio] ') // Code blocks
    .replace(/`([^`]+)`/g, '$1')                                        // Inline code
    .replace(/\*\*(.*?)\*\*/g, '$1')                                    // Bold
    .replace(/\*(.*?)\*/g, '$1')                                        // Italic
    .replace(/#+\s+/g, '')                                              // Headings
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')                                 // Links
    .replace(/^[-*•]\s+/gm, '')                                         // Bullet points
    .replace(/([0-9]+)\.\s+/g, '$1. ')                                  // Numbered lists
    .replace(/([?!.])\s*([?!.])+/g, '$1')                               // Multiple punctuation
    .replace(/\s+/g, ' ')                                               // Normalize whitespace
    .trim();

  // Apply human speech gaps, breathing pauses, and natural conversational cadence
  text = humanizeConversationalCadence(text);

  // Safety length limit (1500 chars max per spoken turn for optimal delivery)
  if (text.length > 1500) {
    const periodIdx = text.lastIndexOf('.', 1500);
    text = periodIdx > 800 ? text.slice(0, periodIdx + 1) : text.slice(0, 1500) + '...';
  }

  return text;
}

function escapeSSML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Returns available voice profiles.
 */
function getVoiceList() {
  return CURATED_VOICES;
}

/**
 * Synthesizes neural audio stream.
 * @param {string} rawText - Text to speak
 * @param {string} voice - Neural voice identifier
 * @param {object} options - rate, pitch, volume adjustments
 * @returns {Promise<{ stream: ReadableStream, contentType: string }>}
 */
async function generateSpeechStream(rawText, voice = DEFAULT_VOICE, options = {}) {
  const cleaned = cleanTextForTTS(rawText);
  if (!cleaned) {
    const err = new Error('No valid text provided for speech synthesis');
    err.status = 400;
    throw err;
  }

  const selectedVoice = CURATED_VOICES.some(v => v.id === voice) ? voice : DEFAULT_VOICE;
  const safeSSMLText = escapeSSML(cleaned);

  const tts = new MsEdgeTTS();
  await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const rate = options.rate || '-3%';
  const pitch = options.pitch || '+0Hz';

  const { audioStream } = tts.toStream(safeSSMLText, { rate, pitch });
  return { audioStream, text: cleaned, voice: selectedVoice };
}

/**
 * Synthesizes neural audio buffer (cached for instant replay).
 * @param {string} rawText 
 * @param {string} voice 
 * @returns {Promise<Buffer>}
 */
async function generateSpeechBuffer(rawText, voice = DEFAULT_VOICE, options = {}) {
  const cleaned = cleanTextForTTS(rawText);
  if (!cleaned) {
    const err = new Error('No valid text provided for speech synthesis');
    err.status = 400;
    throw err;
  }

  const selectedVoice = CURATED_VOICES.some(v => v.id === voice) ? voice : DEFAULT_VOICE;
  const cacheKey = `${selectedVoice}:${options.rate || '0'}:${cleaned}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const { audioStream } = await generateSpeechStream(cleaned, selectedVoice, options);

  return new Promise((resolve, reject) => {
    const chunks = [];
    audioStream.on('data', chunk => chunks.push(chunk));
    audioStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (cache.size >= MAX_CACHE_ITEMS) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(cacheKey, buffer);
      resolve(buffer);
    });
    audioStream.on('error', err => reject(err));
  });
}

module.exports = {
  getVoiceList,
  cleanTextForTTS,
  generateSpeechStream,
  generateSpeechBuffer,
  CURATED_VOICES,
  DEFAULT_VOICE,
};
