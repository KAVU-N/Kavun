import React, { useState, useEffect } from 'react';

const COOKIE_KEY = 'cookie_consent_accepted';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#FFE5D9] border-t border-[#FF8B5E] p-4 z-50 flex flex-col md:flex-row items-center justify-between shadow-lg animate-fadeIn">
      <span className="text-[#6B3416] text-sm mb-2 md:mb-0">
        Sitemiz, deneyiminizi geliştirmek için çerezler kullanır. Detaylar için <a href="/cerez-politikasi" className="underline text-[#994D1C] hover:text-[#FF8B5E]">Çerez Politikamızı</a> inceleyebilirsiniz.
      </span>
      <button
        onClick={acceptCookies}
        className="ml-0 md:ml-4 px-6 py-2 bg-[#FF8B5E] text-white rounded hover:bg-[#994D1C] transition-colors duration-300 font-semibold"
      >
        Kabul Et
      </button>
    </div>
  );
}
