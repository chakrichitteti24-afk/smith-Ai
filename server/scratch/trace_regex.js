const { sanitiseAIResponse } = require('../utils/transcriptCleaner');

let t = '## Summary\n\n* **JavaScript** is cool.\n* Use [Groq](http://groq) for speeds.\n\nLet\'s start!';
console.log('Original:', JSON.stringify(t));
t = t.replace(/#{1,6}\s/g, '');
console.log('After headings:', JSON.stringify(t));
t = t.replace(/\*{1,2}(.*?)\*{1,2}/g, '$1');
console.log('After asterisks:', JSON.stringify(t));
t = t.replace(/`{1,3}(.*?)`{1,3}/g, '$1');
console.log('After backticks:', JSON.stringify(t));
t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
console.log('After links:', JSON.stringify(t));
t = t.replace(/^\s*[-*+]\s/gm, '');
console.log('After bullets:', JSON.stringify(t));
t = t.replace(/\n{3,}/g, '\n\n');
console.log('After newlines:', JSON.stringify(t));
