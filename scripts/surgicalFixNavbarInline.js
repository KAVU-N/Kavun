const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const idx = h.indexOf(close, start);
  return idx < 0 ? -1 : idx + close.length;
}

// Work within Profile Dropdown region
const dd = s.indexOf('/* Profile Dropdown */');
if (dd >= 0) {
  const dropStart = s.indexOf('className="fixed right-2 top-20', dd);
  if (dropStart >= 0) {
    const blockStart = s.lastIndexOf('<div', dropStart);
    const closeCond = s.indexOf(')}', dropStart);
    const blockEnd = closeCond > 0 ? closeCond : s.indexOf('</div>', dropStart);

    // 1) Ensure newline between consecutive </Link><Link
    s = s.replace(/<\/Link>\s{2,}<Link/g, '</Link>\n                        <Link');

    // 2) Promote lone href="/projelerim" line to start a Link tag
    s = s.replace(/\n\s*href=\"\/projelerim\"\n/g, '\n                        <Link\n                          href="/projelerim"\n');

    // 3) Remove second duplicate '/ilanlarim' Link block if appears twice consecutively
    const firstIlan = s.indexOf('href="/ilanlarim"', dropStart);
    if (firstIlan >= 0) {
      const firstStart = s.lastIndexOf('<Link', firstIlan);
      const firstEnd = findClosing(s, firstStart, 'Link');
      if (firstStart >= 0 && firstEnd > firstStart) {
        const secondIlan = s.indexOf('href="/ilanlarim"', firstEnd);
        if (secondIlan >= 0) {
          const secondStart = s.lastIndexOf('<Link', secondIlan);
          const secondEnd = findClosing(s, secondStart, 'Link');
          if (secondStart >= 0 && secondEnd > secondStart) {
            s = s.slice(0, secondStart) + s.slice(secondEnd);
          }
        }
      }
    }
  }
}

// Save back with CRLF
fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('surgicalFixNavbarInline: completed');
