const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// 1) Fix wrong comment token: /* ... */} -> {/* ... */}
s = s.replace(/\n(\s*)\/\* Mobilde çıkış yap butonu \*\/\}/g, (m, ind) => `\n${ind}{/* Mobilde çıkış yap butonu */}`);

// 2) Rebuild profile dropdown sequence after messages link
(() => {
  const ddIdx = s.indexOf('/* Profile Dropdown */');
  if (ddIdx < 0) return;
  const msgIdx = s.indexOf('href="/mesajlarim"', ddIdx);
  if (msgIdx < 0) return;
  const msgEnd = findClosing(s, msgIdx, 'Link');
  if (msgEnd < 0) return;
  const projIdx = s.indexOf('href="/projelerim"', msgEnd);
  if (projIdx < 0) return;
  // Replace region [msgEnd, projIdx) with clean ilanlarim link
  const indentMatch = s.slice(0, msgEnd).match(/\n(\s*)$/);
  const ind = indentMatch ? indentMatch[1] : '                        ';
  const ilanBlock = [
    `${ind}<Link`,
    `${ind}  href="/ilanlarim"`,
    `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${ind}>`,
    `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${ind}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${ind}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />`,
    `${ind}    </svg>`,
    `${ind}    <span>{t('nav.myListings')}</span>`,
    `${ind}  </div>`,
    `${ind}</Link>`,
    ''
  ].join('\n');
  s = s.slice(0, msgEnd) + ilanBlock + s.slice(projIdx);
})();

// 3) Remove any stray duplicated svg/span/link chunk between kulüplerim and logout button
(() => {
  const kulIdx = s.indexOf('href="/kuluplerim"');
  if (kulIdx < 0) return;
  const kulEnd = findClosing(s, kulIdx, 'Link');
  if (kulEnd < 0) return;
  // Find next logout button start within dropdown region
  const btnIdx = s.indexOf('<button', kulEnd);
  if (btnIdx < 0) return;
  // Clean up everything between kulEnd and btnIdx
  s = s.slice(0, kulEnd) + '\n' + s.slice(btnIdx);
})();

// 4) In mobile menu, normalize the "/ilanlarim" link block (single label outside the relative div)
(() => {
  // Find mobile messages link area
  const mobileArea = s.indexOf('/* Mobile Menu */');
  if (mobileArea < 0) return;
  const mobMsg = s.indexOf('href="/mesajlarim"', mobileArea);
  const mobIlan = s.indexOf('href="/ilanlarim"', mobMsg);
  if (mobIlan < 0) return;
  const mobIlanEnd = findClosing(s, mobIlan, 'Link');
  if (mobIlanEnd < 0) return;
  const rebuilt = [
    '                    <Link',
    '                      href="/ilanlarim"',
    '                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"',
    '                      onClick={() => setIsMenuOpen(false)}',
    '                    >',
    '                      <div className="relative">',
    '                        <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
    '                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',
    '                        </svg>',
    '                      </div>',
    '                      <span>{t(\'nav.myListings\')}</span>',
    '                    </Link>',
    ''
  ].join('\n');
  s = s.slice(0, mobIlan) + rebuilt + s.slice(mobIlanEnd);
})();

// 5) Save with CRLF
fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarFinalize: completed');
