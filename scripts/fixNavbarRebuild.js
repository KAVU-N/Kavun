const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// 1) Fix comment token if malformed
s = s.replace(/\n(\s*)\/\* Mobilde çıkış yap butonu \*\/\}/g, (m, ind) => `\n${ind}{/* Mobilde çıkış yap butonu */}`);

// 2) Rebuild ilanlarim link right after '/mesajlarim' in profile dropdown
(() => {
  const msgIdx = s.indexOf('href="/mesajlarim"');
  if (msgIdx < 0) return;
  const msgEnd = findClosing(s, msgIdx, 'Link');
  if (msgEnd < 0) return;
  // Find the first Link after messages
  const linkStart = s.indexOf('<Link', msgEnd);
  if (linkStart < 0) return;
  // Find the projelerim link start to bound replacement
  const projHref = s.indexOf('href="/projelerim"', linkStart);
  if (projHref < 0) return;
  const projLinkStart = s.lastIndexOf('<Link', projHref);
  if (projLinkStart < 0) return;
  // Build clean ilanlarim block
  const indentMatch = s.slice(0, linkStart).match(/\n(\s*)$/);
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
  s = s.slice(0, linkStart) + ilanBlock + s.slice(projLinkStart);
})();

// 3) Normalize mobile ilanlarim block: exactly one label outside relative div
(() => {
  const mobileArea = s.indexOf('/* Mobile Menu */');
  if (mobileArea < 0) return;
  const mobIlanHref = s.indexOf('href="/ilanlarim"', mobileArea);
  if (mobIlanHref < 0) return;
  const mobLinkStart = s.lastIndexOf('<Link', mobIlanHref);
  if (mobLinkStart < 0) return;
  const mobLinkEnd = findClosing(s, mobLinkStart, 'Link');
  if (mobLinkEnd < 0) return;
  const mobIndentMatch = s.slice(0, mobLinkStart).match(/\n(\s*)$/);
  const ind = mobIndentMatch ? mobIndentMatch[1] : '                    ';
  const rebuilt = [
    `${ind}<Link`,
    `${ind}  href="/ilanlarim"`,
    `${ind}  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"`,
    `${ind}  onClick={() => setIsMenuOpen(false)}`,
    `${ind}>`,
    `${ind}  <div className="relative">`,
    `${ind}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${ind}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
    `${ind}    </svg>`,
    `${ind}  </div>`,
    `${ind}  <span>{t('nav.myListings')}</span>`,
    `${ind}</Link>`,
    ''
  ].join('\n');
  s = s.slice(0, mobLinkStart) + rebuilt + s.slice(mobLinkEnd);
})();

// 4) Remove leftover excessive empty lines
s = s.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarRebuild: completed');
