/**
 * transcriptCleaner.js
 *
 * Utility helpers that prepare raw transcripts before
 * they are sent to Groq for intent detection.
 *
 * Rules:
 *  - collapse multiple spaces
 *  - strip leading/trailing whitespace
 *  - remove obvious filler words (a second, heavier pass runs in Groq)
 *  - enforce minimum length guard (< 4 words → rejected)
 */

const FILLER_PATTERN = /\b(um+|uh+|er+|ah+|like|you know|i mean|sort of|kind of|basically|literally|honestly|actually|so yeah|right right|okay so)\b/gi;

/**
 * Light local cleanup before sending to Groq.
 * @param {string} raw  - Raw transcript string from Whisper
 * @returns {{ cleaned: string, wordCount: number, valid: boolean }}
 */
function preClean(raw) {
  if (!raw || typeof raw !== 'string') {
    return { cleaned: '', wordCount: 0, valid: false };
  }

  const cleaned = raw
    .replace(FILLER_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    cleaned,
    wordCount,
    valid: wordCount >= 4,
  };
}

/**
 * Sanitise AI output — strip markdown formatting, trim whitespace.
 * AI responses should never contain markdown, but just in case.
 * @param {string} text
 * @returns {string}
 */
function sanitiseAIResponse(text) {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s/g, '')            // strip heading markers
    .replace(/\*\*([^*\r\n]+?)\*\*/g, '$1')  // strip bold markers
    .replace(/\*([^*\r\n]+?)\*/g, '$1')    // strip italic markers
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')  // strip code backticks, KEEP the inner text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links, keep label
    .replace(/^\s*[-*+]\s/gm, '')        // strip list bullet markers
    .replace(/\n{3,}/g, '\n\n')          // collapse excess newlines
    .trim();
}

module.exports = { preClean, sanitiseAIResponse };
