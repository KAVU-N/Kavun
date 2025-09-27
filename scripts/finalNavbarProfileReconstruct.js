const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function findPrev(h, needle, from) {
  const i = h.lastIndexOf(needle, from);
  return i;
}
function findClosing(h, start, tag) {
  const close = `</${tag}>`;
  const i = h.indexOf(close, start);
  return i < 0 ? -1 : i + close.length;
}

// Rebuild the dropdown links between /profil and /kuluplerim inclusively
(() => {
  const dd = s.indexOf('/* Profile Dropdown */');
  if (dd < 0) return;
  const profilHref = s.indexOf('href="/profil"', dd);
  if (profilHref < 0) return;
  const profilStart = findPrev(s, '<Link', profilHref);
  if (profilStart < 0) return;
  const kulHref = s.indexOf('href="/kuluplerim"', profilStart);
  if (kulHref < 0) return;
  const kulStart = findPrev(s, '<Link', kulHref);
  if (kulStart < 0) return;
  const kulEnd = findClosing(s, kulStart, 'Link');
  if (kulEnd < 0) return;

  const indent = (s.slice(0, profilStart).match(/\n(\s*)$/) || [,'                        '])[1];
  const rebuilt = [
    `${indent}<Link`,
    `${indent}  href="/profil"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />`,
    `${indent}    </svg>`,
    `${indent}    <span>{t('nav.profile')}</span>`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/bildirimler"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <div className="relative">`,
    `${indent}      <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}        <path`,
    `${indent}          strokeLinecap="round"`,
    `${indent}          strokeLinejoin="round"`,
    `${indent}          strokeWidth={2}`,
    `${indent}          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m 6 0H9"`,
    `${indent}        />`,
    `${indent}      </svg>`,
    `${indent}      {unreadNotifications > 0 && (`,
    `${indent}        <div className=\"absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full\"></div>`,
    `${indent}      )}`,
    `${indent}    </div>`,
    `${indent}    <span>{t('nav.notifications')}</span>`,
    `${indent}    {unreadNotifications > 0 && (`,
    `${indent}      <span className=\"ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center md:text-xs md:h-5 md:w-5 text-[10px] h-4 w-4\">`,
    `${indent}        {unreadNotifications > 9 ? '9+' : unreadNotifications}`,
    `${indent}      </span>`,
    `${indent}    )}`,
    `${indent}  </div>`,
    `${indent}</Link>`,
    `${indent}<Link`,
    `${indent}  href="/mesajlarim"`,
    `${indent}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
    `${indent}>`,
    `${indent}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
    `${indent}    <div className="relative">`,
    `${indent}      <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
    `${indent}        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />`,
    `${indent}      </svg>`,
    `${indent}      {unreadMessages > 0 && (`,
    `${indent}        <div className=\"absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full\"></div>`,
    `${indent}      )}`,
    `${indent}    </div>`,
    `${indent}    <span>{t('nav.messages')}</span>`,
    `${indent}    {unreadMessages > 0 && (`,
    `${indent}      <span className=\"ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center md:text-xs md:h-5 md:w-5 text-[10px] h-4 w-4\">`,
    `${indent}        {unreadMessages > 9 ? '9+' : unreadMessages}`,
    `${indent}      </span>`,
    `${indent}    )}`,
    `${indent}  </div>`,
    `${indent}</Link>`,
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

  s = s.slice(0, profilStart) + rebuilt + s.slice(kulEnd);
})();

// Clean any lone attribute lines and excessive spaces
s = s.replace(/\n\s*href=\"\/projelerim\"\n/g, '\n');
s = s.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('finalNavbarProfileReconstruct: completed');
