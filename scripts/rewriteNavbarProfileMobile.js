const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findAfter(hay, needle, from) {
  const i = hay.indexOf(needle, from);
  return i < 0 ? -1 : i + needle.length;
}
function find(hay, needle, from) {
  return hay.indexOf(needle, from);
}
function findClosingLink(hay, start) {
  const end = hay.indexOf('</Link>', start);
  return end < 0 ? -1 : end + '</Link>'.length;
}

// 1) Fix profile dropdown block between messages link and projelerim link
(() => {
  const dropdownStart = find(s, '/* Profile Dropdown */');
  if (dropdownStart < 0) return;
  const msgLink = find(s, 'href="/mesajlarim"', dropdownStart);
  if (msgLink < 0) return;
  const msgEnd = findClosingLink(s, msgLink);
  if (msgEnd < 0) return;
  const projLink = find(s, 'href="/projelerim"', msgEnd);
  if (projLink < 0) return;
  // Replace everything from msgEnd to projLink with the correct ilanlarim block
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
  s = s.slice(0, msgEnd) + ilanBlock + s.slice(projLink);
})();

// 2) Remove any duplicated stray projeler svg/link chunk after kulüplerim (defensive)
(() => {
  const kul = find(s, 'href="/kuluplerim"');
  if (kul < 0) return;
  const endKul = findClosingLink(s, kul);
  if (endKul < 0) return;
  // If another </Link> immediately follows with same svg path for projects, collapse it
  const after = s.slice(endKul, endKul + 400);
  const projSvgPath = 'd="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7m-6 4l-4 4-4-4"';
  // Use a simpler heuristic: if we see '<svg' then '<span>{t('nav.myProjects')}', remove that whole link
  const svgIdx = after.indexOf('<svg');
  const spanIdx = after.indexOf("<span>{t('nav.myProjects')}</span>");
  if (svgIdx >= 0 && spanIdx > svgIdx) {
    const nextLinkStart = endKul + after.indexOf('<svg');
    const nextLinkEnd = findClosingLink(s, nextLinkStart);
    if (nextLinkEnd > 0) {
      s = s.slice(0, nextLinkStart) + s.slice(nextLinkEnd);
    }
  }
})();

// 3) Fix mobile ilanlarim block: ensure a single label outside the relative div
(() => {
  const mob = find(s, '\n                    <Link\n                      href="/ilanlarim"');
  if (mob < 0) return;
  const mobEnd = findClosingLink(s, mob);
  if (mobEnd < 0) return;
  const before = s.slice(0, mob);
  const block = s.slice(mob, mobEnd);
  const after = s.slice(mobEnd);
  // Rebuild
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
  s = before + rebuilt + after;
})();

// 4) Save back (CRLF)
fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('rewriteNavbarProfileMobile: completed');
