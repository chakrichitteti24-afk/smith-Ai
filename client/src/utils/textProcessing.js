export const TECHNICAL_TERMS = new Set([
  'python', 'java', 'javascript', 'react', 'node.js', 'docker', 'kubernetes',
  'linux', 'git', 'rest api', 'sql', 'mongodb', 'groq', 'gemini', 'openai',
  'whisper', 'monaco'
]);

// Only remove pure noise words in real-time. 
// "like", "actually", "basically", "you know" can be valid sentence parts, 
// so they are preserved in live transcript and cleaned by the LLM later if used as fillers.
export const OBVIOUS_FILLERS = new Set(['um', 'uh', 'ah', 'hmm']);

export function cleanLiveText(finalText, interimText) {
  let combined = (finalText + ' ' + interimText).trim();
  if (!combined) return '';

  const words = combined.split(/\s+/).filter(Boolean);
  const cleanedWords = [];

  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i];
    const wordLower = rawWord.toLowerCase().replace(/[^a-z0-9.]/g, '');

    // Skip pure noise fillers
    if (OBVIOUS_FILLERS.has(wordLower)) {
      continue;
    }

    // Remove duplicate adjacent words (e.g., "I I am" -> "I am")
    if (i > 0) {
      const prevWordLower = cleanedWords[cleanedWords.length - 1]?.toLowerCase().replace(/[^a-z0-9.]/g, '');
      if (wordLower === prevWordLower && wordLower !== '') {
        continue;
      }
    }

    cleanedWords.push(rawWord);
  }

  // Remove adjacent duplicate phrases (up to 2 words, e.g., "I am I am" -> "I am")
  let finalStr = cleanedWords.join(' ');
  finalStr = finalStr.replace(/\b([a-zA-Z0-9]+(?: [a-zA-Z0-9]+)?)\s+\1\b/gi, '$1');

  return finalStr;
}

export function finalTranscriptCleanup(text) {
  if (!text) return '';

  let cleaned = cleanLiveText('', text);

  // Normalize punctuation: remove spaces before punctuation
  cleaned = cleaned.replace(/\s+([.,?!;:])/g, '$1');

  // Capitalize sentence beginnings
  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());

  // Preserve technical terms case (best effort)
  TECHNICAL_TERMS.forEach((term) => {
    const regex = new RegExp(`\\b${term.replace('.', '\\.')}\\b`, 'gi');
    cleaned = cleaned.replace(regex, term === 'node.js' ? 'Node.js' : 
                                     term === 'rest api' ? 'REST API' : 
                                     term === 'javascript' ? 'JavaScript' :
                                     term === 'mongodb' ? 'MongoDB' :
                                     term === 'react' ? 'React' :
                                     term === 'kubernetes' ? 'Kubernetes' :
                                     term === 'docker' ? 'Docker' :
                                     term === 'linux' ? 'Linux' :
                                     term === 'git' ? 'Git' :
                                     term === 'sql' ? 'SQL' :
                                     term === 'groq' ? 'Groq' :
                                     term === 'gemini' ? 'Gemini' :
                                     term === 'openai' ? 'OpenAI' :
                                     term === 'whisper' ? 'Whisper' :
                                     term === 'monaco' ? 'Monaco' :
                                     term === 'python' ? 'Python' :
                                     term === 'java' ? 'Java' : term);
  });

  return cleaned.trim();
}
