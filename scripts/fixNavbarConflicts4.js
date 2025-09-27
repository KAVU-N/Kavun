const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let content = fs.readFileSync(target, 'utf8');

// Normalize EOLs
content = content.replace(/\r\n?/g, '\n');

function findClosing(html, start, tag) {
  const close = `</${tag}>`;
  const idx = html.indexOf(close, start);
  return idx === -1 ? -1 : idx + close.length;
}

// 1) Fix malformed comment for mobile logout if present
content = content.replace(/\/\* Mobilde çıkış yap butonu \*\/\}/g, '{/* Mobilde çıkış yap butonu */}');

// 2) Rebuild profile dropdown links after "/mesajlarim"
(() => {
  const containerIdx = content.indexOf('fixed right-2 top-20');
  if (containerIdx === -1) return;
  const msgIdx = content.indexOf('href="/mesajlarim"', containerIdx);
  if (msgIdx === -1) return;
  const msgEnd = findClosing(content, msgIdx, 'Link');
  if (msgEnd === -1) return;
  // Find desktop dropdown logout button (span logout) to bound end
  const logoutSpanIdx = content.indexOf("<span>{t('nav.logout')}</span>", msgEnd);
  const btnStart = logoutSpanIdx !== -1 ? content.lastIndexOf('<button', logoutSpanIdx) : -1;
  if (btnStart === -1) return;

  // Indentation: look back for indentation before a Link
  const indentMatch = content.slice(0, msgEnd).match(/\n(\s*)<\/?Link[^>]*>\s*$/);
  const indent = indentMatch ? indentMatch[1] : '                        ';
  const rebuilt = [
    `${indent}<Link`,
    `${indent}  href="/ilanlarim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className=\"w-4 h-4 md:w-4 md:h-4 w-3 h-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">`,
    `${indent}      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z\" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{t('nav.myListings')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/projelerim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className=\"w-4 h-4 md:w-4 md:h-4 w-3 h-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">`,
    `${indent}      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-6 4l-4 4-4-4\" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{t('nav.myProjects')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/kuluplerim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className=\"w-4 h-4 md:w-4 md:h-4 w-3 h-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">`,
    `${indent}      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M17 20h5v-2a4 4 0 00-3-3.87M12 20v-2a4 4 0 013-3.87M7 20H2v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z\" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{(t('nav.myClub') || 'Kulübüm')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    ''
  ].join('\n');

  content = content.slice(0, msgEnd) + rebuilt + content.slice(btnStart);
})();

// 3) Fix mobile "/ilanlarim" block: ensure label is outside the relative div and only once
(() => {
  const mobIdx = content.indexOf('\n                    <Link\n                      href="/ilanlarim"');
  if (mobIdx === -1) return;
  const mobEnd = findClosing(content, mobIdx, 'Link');
  if (mobEnd === -1) return;
  let block = content.slice(mobIdx, mobEnd);
  // Move any spans with label outside the div and keep only one
  block = block.replace(/(<div className=\"relative\">[\s\S]*?<\/svg>)[\s\S]*?<\/div>[\s\S]*/m,
    `$1\n                      </div>\n                      <span>{t('nav.myListings')}</span>\n                    `);
  content = content.slice(0, mobIdx) + block + content.slice(mobEnd);
})();

// 4) Remove any duplicated consecutive \n lines
content = content.replace(/\n{3,}/g, '\n\n');

// Save with CRLF
fs.writeFileSync(target, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarConflicts4: completed');
