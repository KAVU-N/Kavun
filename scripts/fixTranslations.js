const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'contexts', 'LanguageContext.tsx');

const content = fs.readFileSync(filePath, 'utf8');

const trMatch = content.match(/tr:\s*{([\s\S]*?)\n\s*},\s*en:/);
if (!trMatch) {
  throw new Error('Could not find Turkish translation block');
}

const enMatch = content.match(/en:\s*{([\s\S]*?)\n\s*}\s*,\s*\n};/);
if (!enMatch) {
  throw new Error('Could not find English translation block');
}

const toObject = (block) => {
  try {
    // eslint-disable-next-line no-eval
    return eval(`({${block}})`);
  } catch (err) {
    throw new Error('Failed to parse translation block: ' + err.message);
  }
};

const trObj = toObject(trMatch[1]);
const enObj = toObject(enMatch[1]);

const allKeys = Array.from(new Set([...Object.keys(trObj), ...Object.keys(enObj)])).sort();

for (const key of allKeys) {
  if (!(key in trObj)) {
    trObj[key] = enObj[key] ?? '';
  }
  if (!(key in enObj)) {
    enObj[key] = trObj[key] ?? '';
  }
}

const escapeValue = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
};

const buildBlock = (obj) => allKeys.map((key) => `    '${key}': '${escapeValue(obj[key])}',`).join('\n');

const newTrBlock = buildBlock(trObj);
const newEnBlock = buildBlock(enObj);

let newContent = content.replace(/tr:\s*{([\s\S]*?)\n\s*},\s*en:/, () => `tr: {\n${newTrBlock}\n  },\n\n  en:`);
newContent = newContent.replace(/en:\s*{([\s\S]*?)\n\s*}\s*,\s*\n};/, () => `en: {\n${newEnBlock}\n  },\n};`);

fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Translation blocks synchronized.');
