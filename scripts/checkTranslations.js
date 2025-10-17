const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'contexts', 'LanguageContext.tsx');
const text = fs.readFileSync(filePath, 'utf8');

const extractTrBlock = () => {
  const regex = /tr:\s*{([\s\S]*?)\n\s*},\s*en:/m;
  const match = text.match(regex);
  if (!match) {
    throw new Error('Could not locate tr block');
  }
  return match[1];
};

const extractEnBlock = () => {
  const regex = /en:\s*{([\s\S]*)$/m;
  const match = text.match(regex);
  if (!match) {
    throw new Error('Could not locate en block');
  }
  const block = match[1];
  let depth = 1;
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) {
      return block.slice(0, i);
    }
  }
  throw new Error('Unterminated en block');
};

const getKeys = (block) => {
  const regex = /'([^']+?)'\s*:/g;
  const keys = new Set();
  let match;
  while ((match = regex.exec(block))) {
    keys.add(match[1]);
  }
  return keys;
};

const trKeys = getKeys(extractTrBlock());
const enKeys = getKeys(extractEnBlock());

const missingInEn = [...trKeys].filter((key) => !enKeys.has(key)).sort();
const missingInTr = [...enKeys].filter((key) => !trKeys.has(key)).sort();

const output = {
  missingInEnglish: missingInEn,
  missingInTurkish: missingInTr,
  counts: {
    english: missingInEn.length,
    turkish: missingInTr.length,
  },
};

const outputPath = path.join(__dirname, 'missingTranslations.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log('Missing in English translations:', missingInEn.length);
console.log('Missing in Turkish translations:', missingInTr.length);
console.log('Details saved to', outputPath);
