const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// 1) Remove any leftover block between '/kuluplerim' closing and mobile-logout comment
(() => {
  const kul = s.indexOf('href="/kuluplerim"');
  if (kul < 0) return;
  const kulEnd = findClosing(s, kul, 'Link');
  if (kulEnd < 0) return;
  const marker = s.indexOf('{/* Mobilde çıkış yap butonu */}', kulEnd);
  if (marker < 0) return;
  // Keep exactly one newline between
  s = s.slice(0, kulEnd) + '\n' + s.slice(marker);
})();

// 2) Rewrite mobile '/ilanlarim' block: ensure closing div after svg and single label outside
(() => {
  // Find mobile menu area
  const mobileArea = s.indexOf('/* Mobile Menu */');
  if (mobileArea < 0) return;
  // Find first '/ilanlarim' link after mobileArea
  const hrefIdx = s.indexOf('href="/ilanlarim"', mobileArea);
  if (hrefIdx < 0) return;
  const linkStart = s.lastIndexOf('<Link', hrefIdx);
  const linkEnd = findClosing(s, linkStart, 'Link');
  if (linkStart < 0 || linkEnd < 0) return;
  const before = s.slice(0, linkStart);
  const after = s.slice(linkEnd);
  const indent = s.slice(0, linkStart).match(/\n(\s*)$/)?.[1] || '                    ';
  const rebuilt = [
    `${indent}<Link`,
    `${indent}  href="/ilanlarim"`,
    `${indent}  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"`,
    `${indent}  onClick={() => setIsMenuOpen(false)}`,
    `${indent}>`,
    `${indent}  <div className="relative">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
    `${indent}    </svg>`,
    `${indent}  </div>`,
    `${indent}  <span>{t('nav.myListings')}</span>`,
    `${indent}</Link>`,
    ''
  ].join('\n');
  s = before + rebuilt + after;
})();

// 3) Ensure there are no duplicate labels in mobile block
s = s.replace(/(<span>\{t\('nav.myListings'\)\}<\/span>\n\s*){2,}/g, '<span>{t(\'nav.myListings\')}</span>\n');

// Save back
fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarFinalClean: completed');
