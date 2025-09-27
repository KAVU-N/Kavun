const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let content = fs.readFileSync(target, 'utf8');

// Normalize EOL
content = content.replace(/\r\n?/g, '\n');

// Helper to find the closing </Link> for a <Link starting at idx
function findClosingLink(html, startIdx) {
  const closeIdx = html.indexOf('</Link>', startIdx);
  return closeIdx === -1 ? -1 : closeIdx + '</Link>'.length;
}

// 1) Rebuild desktop profile dropdown sequence after messages link
(() => {
  const msgIdx = content.indexOf('href="/mesajlarim"');
  if (msgIdx === -1) return;
  const msgEnd = findClosingLink(content, msgIdx);
  if (msgEnd === -1) return;

  // The next block begins with a <Link in the same dropdown
  const nextLinkIdx = content.indexOf('<Link', msgEnd);
  if (nextLinkIdx === -1) return;

  // End boundary: the logout button comment
  const endMarker = '/* Mobilde çıkış yap butonu */';
  const endIdx = content.indexOf(endMarker, nextLinkIdx);
  if (endIdx === -1) return;

  // Indentation
  const matchIndent = content.slice(0, nextLinkIdx).match(/\n(\s*)<Link\s*$/);
  const indent = matchIndent ? matchIndent[1] : '                        ';

  const rebuilt = [
    `${indent}<Link`,
    `${indent}  href="/ilanlarim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{t('nav.myListings')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/projelerim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-6 4l-4 4-4-4" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{t('nav.myProjects')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/kuluplerim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M12 20v-2a4 4 0 013-3.87M7 20H2v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{(t('nav.myClub') || 'Kulübüm')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    ''
  ].join('\n');

  content = content.slice(0, nextLinkIdx) + rebuilt + content.slice(endIdx);
})();

// 2) Insert mobile "/ilanlarim" link after mobile messages
(() => {
  const mobileMsgIdx = content.indexOf('\n                    <Link\n                      href="/mesajlarim"');
  if (mobileMsgIdx === -1) return;
  const mobileMsgEnd = findClosingLink(content, mobileMsgIdx);
  if (mobileMsgEnd === -1) return;

  // If already has /ilanlarim in next few lines, skip insert
  const probe = content.slice(mobileMsgEnd, mobileMsgEnd + 400);
  if (probe.includes('href="/ilanlarim"')) return;

  const indent = '                    ';
  const insert = [
    `${indent}<Link`,
    `${indent}  href="/ilanlarim"`,
    `${indent}  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#994D1C] hover:text-[#6B3416] transition-all duration-300 hover:bg-[#FFF5F0]"`,
    `${indent}  onClick={() => setIsMenuOpen(false)}`,
    `${indent}>`,
    `${indent}  <div className="relative">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />`,
    `${indent}    </svg>`,
    `${indent}  </div>`,
    `${indent}  <span>{t('nav.myListings')}</span>`,
    `${indent}</Link>`,
    ''
  ].join('\n');

  content = content.slice(0, mobileMsgEnd) + insert + content.slice(mobileMsgEnd);
})();

// 3) Save back with CRLF
fs.writeFileSync(target, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarConflicts3: completed');
