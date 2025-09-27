const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// Find the profile dropdown block
const dropdownMarker = '/* Profile Dropdown */';
const dd = s.indexOf(dropdownMarker);
if (dd >= 0) {
  const msgIdx = s.indexOf('href="/mesajlarim"', dd);
  if (msgIdx >= 0) {
    const msgEnd = findClosing(s, msgIdx, 'Link');
    if (msgEnd >= 0) {
      const kulIdx = s.indexOf('href="/kuluplerim"', msgEnd);
      if (kulIdx >= 0) {
        const kulLinkStart = s.lastIndexOf('<Link', kulIdx);
        const kulEnd = findClosing(s, kulLinkStart, 'Link');
        if (kulLinkStart >= 0 && kulEnd > kulLinkStart) {
          // Determine indentation from following code
          const indentMatch = s.slice(0, msgEnd).match(/\n(\s*)$/);
          const ind = indentMatch ? indentMatch[1] : '                        ';
          const rebuilt = [
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
            `${ind}<Link`,
            `${ind}  href="/projelerim"`,
            `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
            `${ind}>`,
            `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
            `${ind}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
            `${ind}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-6 4l-4 4-4-4" />`,
            `${ind}    </svg>`,
            `${ind}    <span>{t('nav.myProjects')}</span>`,
            `${ind}  </div>`,
            `${ind}</Link>`,
            `${ind}<Link`,
            `${ind}  href="/kuluplerim"`,
            `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
            `${ind}>`,
            `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
            `${ind}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
            `${ind}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M12 20v-2a4 4 0 013-3.87M7 20H2v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />`,
            `${ind}    </svg>`,
            `${ind}    <span>{(t('nav.myClub') || 'Kulübüm')}</span>`,
            `${ind}  </div>`,
            `${ind}</Link>`,
            ''
          ].join('\n');
          s = s.slice(0, msgEnd) + rebuilt + s.slice(kulEnd);
        }
      }
    }
  }
}

// Clean up any stray 'href="/projelerim"' that appears alone on a line
s = s.replace(/\n\s*href=\"\/projelerim\"\n/g, '\n');

// Save with CRLF
fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('repairNavbarProfileBlock: completed');
