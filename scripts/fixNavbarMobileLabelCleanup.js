const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// Operate only within Mobile Menu area
const mobileMarker = '/* Mobile Menu */';
const mobArea = s.indexOf(mobileMarker);
if (mobArea >= 0) {
  const hrefIdx = s.indexOf('href="/ilanlarim"', mobArea);
  if (hrefIdx >= 0) {
    const linkStart = s.lastIndexOf('<Link', hrefIdx);
    const linkEnd = findClosing(s, linkStart, 'Link');
    if (linkStart >= 0 && linkEnd > linkStart) {
      let block = s.slice(linkStart, linkEnd);
      // Remove duplicate labels inside the relative div
      const labelRegex = /\n\s*<span>\{t\('nav.myListings'\)\}<\/span>/g;
      let count = 0;
      block = block.replace(labelRegex, () => (++count > 0 ? '' : '<SPAN_PLACEHOLDER/>'));
      // Ensure the label placeholder is after the closing relative div
      block = block.replace(/(<div className=\"relative\">[\s\S]*?<\/svg>\s*)([\s\S]*?)<\/div>/m, `$1</div>\n                      <SPAN_PLACEHOLDER/>`);
      // Replace placeholder with proper label
      block = block.replace(/<SPAN_PLACEHOLDER\/>/g, "<span>{t('nav.myListings')}</span>");
      // If still no label exists, add one after the div
      if (!/\{t\('nav.myListings'\)\}/.test(block)) {
        block = block.replace(/<\/div>\s*$/, `</div>\n                      <span>{t('nav.myListings')}</span>`);
      }
      s = s.slice(0, linkStart) + block + s.slice(linkEnd);
    }
  }
}

fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarMobileLabelCleanup: completed');
