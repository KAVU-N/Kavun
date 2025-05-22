'use client';
import React from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';

export default function CookieConsentBar() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Kabul Et"
      declineButtonText="Reddet"
      enableDeclineButton
      cookieName="kavunla_cookie_consent"
      style={{ background: '#FFE5D9', color: '#6B3416', fontSize: '16px', zIndex: 9999 }}
      buttonStyle={{ background: '#FF8B5E', color: '#fff', fontWeight: 'bold', borderRadius: '6px', padding: '8px 24px' }}
      declineButtonStyle={{ background: '#994D1C', color: '#fff', fontWeight: 'bold', borderRadius: '6px', padding: '8px 24px', marginLeft: '8px' }}
      expires={365}
      onAccept={() => {
        try {
          console.debug('Çerezler kabul edildi.');
        } catch (e) {
          console.error('Çerez kabulü sırasında hata:', e);
        }
      }}
      onDecline={() => {
        try {
          console.debug('Çerezler reddedildi.');
        } catch (e) {
          console.error('Çerez reddi sırasında hata:', e);
        }
      }}
      overlay
    >
      Sitemiz, deneyiminizi geliştirmek için çerezler kullanır. Detaylar için <a href="/cerez-politikasi" style={{ textDecoration: 'underline', color: '#994D1C' }}>Çerez Politikamızı</a> inceleyebilirsiniz.
    </CookieConsent>
  );
}
