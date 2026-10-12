import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');
// Comprehensive Emoji regex
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{21AA}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FB}\u{25FC}\u{25B6}\u{25C0}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Exclude Quranic Arabic marks like ۖ ۗ ۚ ۛ ۜ ۞ ۟ ۠ ۡ ۢ ۣ ۥ ۦ ۧ ۨ ۩ ۪ ۫ ۬ ۭ
        // and Arabic text
        const matches = line.match(emojiRegex);
        if (matches) {
          // Filter out false positives if any (e.g. Arabic signs if matched by accident)
          const actualEmojis = matches.filter(m => {
            const code = m.codePointAt(0);
            // Arabic and Quranic symbols are in 0x0600 - 0x08FF and 0xFB50 - 0xFDFF and 0xFE70 - 0xFEFF
            if (code >= 0x0600 && code <= 0x08FF) return false;
            if (code >= 0xFB50 && code <= 0xFDFF) return false;
            if (code >= 0xFE70 && code <= 0xFEFF) return false;
            return true;
          });
          if (actualEmojis.length > 0) {
            console.log(`${path.relative(process.cwd(), fullPath)}:${index + 1}: [${actualEmojis.join(' ')}] ${line.trim().slice(0, 100)}`);
          }
        }
      });
    }
  }
}

console.log('=== SCANNING FOR EMOJIS IN SRC ===');
scanDir(srcDir);
