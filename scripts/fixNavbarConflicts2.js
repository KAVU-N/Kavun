const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let content = fs.readFileSync(target, 'utf8');

// Helper: normalize EOLs
const EOL = '\n';
content = content.replace(/\r\n?/g, '\n');

// 1) Remove any remaining merge markers (safety)
content = content.replace(/^([<>=]{7}).*\n/gm, '');

// 2) Rebuild the first post-"mesajlarim" block to a clean "/ilanlarim" link
{
  const msgIdx = content.indexOf('href="/mesajlarim"');
  if (msgIdx !== -1) {
    const closeMsgLink = content.indexOf('</Link>', msgIdx);
    if (closeMsgLink !== -1) {
      const startReplace = content.indexOf('<Link', closeMsgLink);
      const nextLink = content.indexOf('<Link', startReplace + 1);
      // Ensure nextLink corresponds to "/projelerim"
      if (startReplace !== -1 && nextLink !== -1 && content.indexOf('href="/projelerim"', startReplace) !== -1 && content.indexOf('href="/projelerim"', startReplace) < nextLink + 200) {
        const indent = content.slice(startReplace - 28, startReplace).match(/\n(\s*)$/)?.[1] || '                        ';
        const rebuilt = `${indent}<Link\n${indent}  href="/ilanlarim"\n${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"\n${indent}>\n${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">\n${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />\n${indent}    </svg>\n${indent}    <span>{t('nav.myListings')}</span>\n${indent}  </div>\n${indent}</Link>\n`;
        content = content.slice(0, startReplace) + rebuilt + content.slice(nextLink);
      }
    }
  }
}

// 3) Remove stray duplicated projeler svg/span chunk (if exists) after "/kuluplerim" block
{
  const kulIdx = content.indexOf('href="/kuluplerim"');
  if (kulIdx !== -1) {
    const endKulLink = content.indexOf('</Link>', kulIdx);
    if (endKulLink !== -1) {
      // Look for a stray svg with the projects path right after
      const strayStart = content.indexOf('<svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-6 4l-4 4-4-4" />\n                      </svg>\n                      <span>{t(\'nav.myProjects\')}</span>\n                      </div>\n                    </Link>\n', endKulLink);
      if (strayStart !== -1) {
        const strayEnd = strayStart + `<svg`.length + 1000; // crude but bounded
        // Remove up to the immediate closing </Link> after the stray start
        const endTag = content.indexOf('</Link>', strayStart);
        if (endTag !== -1) {
          content = content.slice(0, strayStart) + content.slice(endTag + '</Link>'.length + 1);
        }
      }
    }
  }
}

// 4) Normalize: href "/derslerim" -> "/ilanlarim"
content = content.replace(/href=\"\/derslerim\"/g, 'href="/ilanlarim"');

// 5) i18n: myLessons/Derslerim -> myListings
content = content.replace(/\{t\('nav.myLessons'\)\}/g, "{t('nav.myListings')}");
content = content.replace(/<span>İlanlarım<\/span>/g, "<span>{t('nav.myListings')}</span>");
content = content.replace(/<span>Derslerim<\/span>/g, "<span>{t('nav.myListings')}</span>");

// 6) Save
fs.writeFileSync(target, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('fixNavbarConflicts2: completed');
