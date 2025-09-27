const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');
let s = fs.readFileSync(target, 'utf8').replace(/\r\n?/g, '\n');

function idxOf(h, needle, from = 0) { return h.indexOf(needle, from); }

// Find the profile dropdown container open tag
const containerKey = 'className="fixed right-2 top-20';
const cIdx = idxOf(s, containerKey);
if (cIdx >= 0) {
  // Find the end of the opening div tag '>'
  const openEnd = s.indexOf('>', cIdx);
  // Find marker for the following section we keep (mobile logout comment) to bound replacement
  const markerKey = 'Mobilde çıkış yap butonu';
  const markerIdx = idxOf(s, markerKey, openEnd);
  if (openEnd > 0 && markerIdx > 0) {
    // Determine indentation level from next line after opening tag
    const lineStart = s.lastIndexOf('\n', openEnd) + 1;
    const indentMatch = s.slice(lineStart, openEnd + 1).match(/^(\s*)/);
    const ind = indentMatch ? indentMatch[1] : '                      ';

    const rebuilt = [
      `${ind}<Link`,
      `${ind}  href="/profil"`,
      `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
      `${ind}>`,
      `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
      `${ind}    <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
      `${ind}      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />`,
      `${ind}    </svg>`,
      `${ind}    <span>{t('nav.profile')}</span>`,
      `${ind}  </div>`,
      `${ind}</Link>`,
      `${ind}<Link`,
      `${ind}  href="/bildirimler"`,
      `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
      `${ind}>`,
      `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
      `${ind}    <div className="relative">`,
      `${ind}      <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
      `${ind}        <path`,
      `${ind}          strokeLinecap="round"`,
      `${ind}          strokeLinejoin="round"`,
      `${ind}          strokeWidth={2}`,
      `${ind}          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"`,
      `${ind}        />`,
      `${ind}      </svg>`,
      `${ind}      {unreadNotifications > 0 && (`,
      `${ind}        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>`,
      `${ind}      )}`,
      `${ind}    </div>`,
      `${ind}    <span>{t('nav.notifications')}</span>`,
      `${ind}    {unreadNotifications > 0 && (`,
      `${ind}      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center md:text-xs md:h-5 md:w-5 text-[10px] h-4 w-4">`,
      `${ind}        {unreadNotifications > 9 ? '9+' : unreadNotifications}`,
      `${ind}      </span>`,
      `${ind}    )}`,
      `${ind}  </div>`,
      `${ind}</Link>`,
      `${ind}<Link`,
      `${ind}  href="/mesajlarim"`,
      `${ind}  className="block px-4 py-2 text-[#994D1C] hover:bg-[#FFF5F0] hover:text-[#6B3416] transition-colors duration-300"`,
      `${ind}>`,
      `${ind}  <div className="flex items-center space-x-2 md:space-x-2 space-x-1">`,
      `${ind}    <div className="relative">`,
      `${ind}      <svg className="w-4 h-4 md:w-4 md:h-4 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">`,
      `${ind}        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />`,
      `${ind}      </svg>`,
      `${ind}      {unreadMessages > 0 && (`,
      `${ind}        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>`,
      `${ind}      )}`,
      `${ind}    </div>`,
      `${ind}    <span>{t('nav.messages')}</span>`,
      `${ind}    {unreadMessages > 0 && (`,
      `${ind}      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center md:text-xs md:h-5 md:w-5 text-[10px] h-4 w-4">`,
      `${ind}        {unreadMessages > 9 ? '9+' : unreadMessages}`,
      `${ind}      </span>`,
      `${ind}    )}`,
      `${ind}  </div>`,
      `${ind}</Link>`,
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

    s = s.slice(0, openEnd + 1) + '\n' + rebuilt + s.slice(markerIdx);
    fs.writeFileSync(target, s.replace(/\n/g, '\r\n'), 'utf8');
    console.log('forceRebuildProfileDropdown: completed');
  } else {
    console.log('Marker or open tag not found; no changes.');
  }
} else {
  console.log('Dropdown container not found; no changes.');
}
