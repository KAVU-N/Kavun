'use client';

import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Image from 'next/image';

import { useMemo } from 'react';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [state, setState] = useState(null);
  const userInitial = useMemo(() => authUser?.name?.[0]?.toUpperCase() || 'U', [authUser?.name]);
  const shouldRedirect = !authUser;
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth/login');
    }
  }, [shouldRedirect, router]);

  if (shouldRedirect) {
    return null;
  }

  // Profil fotoğrafı componenti
  function ProfilePhoto() {
    return (
      <div className="w-24 h-24 rounded-full bg-[#191921] flex items-center justify-center text-white text-4xl font-bold border-4 border-[#FF9B6A] relative overflow-hidden" style={{letterSpacing: '2px'}}>
        {(authUser as any).profilePhotoUrl ? (
          <Image 
            src={(authUser as any).profilePhotoUrl}
            alt="Profil Fotoğrafı"
            fill
            sizes="96px"
            className="object-cover rounded-full"
          />
        ) : (
          userInitial
        )}
      </div>
    );
  }

  // Hesap durumu componenti
  type AccountStatusProps = { authUser: NonNullable<ReturnType<typeof useAuth>['user']> };
  function AccountStatus({ authUser }: AccountStatusProps) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.accountStatus')}</h2>
        <div className="mt-1 text-lg text-[#6B3416] flex items-center gap-4">
          {authUser.isVerified ? (
            <span className="text-green-600 font-semibold">{t('profile.verified')}</span>
          ) : (
            <>
              <span className="text-red-600 font-semibold">{t('profile.unverified')}</span>
              <button
                className="ml-2 px-3 py-1 bg-[#FF9B6A] text-white rounded-md hover:bg-[#FF8B5E] transition-all text-sm font-semibold"
                onClick={async () => {
                  await fetch('/api/auth/send-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authUser.email })
                  });
                  router.push('/auth/verify');
                }}
              >
                {t('profile.verify')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EEE8FC]">
          {/* Modern üst blok */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl md:text-3xl font-bold text-[#6B3416]">{authUser.name}</div>
            </div>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-8 border border-[#EEE8FC]">
              {/* Profil fotoğrafı yükleme alanı */}
              <div className="relative flex flex-col items-center mb-4">
                <ProfilePhoto />
              </div>
              <Link 
                href="/profil/duzenle" 
                className="px-4 py-2 border border-[#FF9B6A] text-[#FF9B6A] rounded-lg hover:bg-[#FF9B6A] hover:text-white transition-colors font-medium text-sm mt-4"
              >
                ✏ {t('profile.editProfile')}
              </Link>
            </div>
          </div>

          {/* Hesap Durumu sadece burada */}
          <AccountStatus authUser={authUser} />

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.fullName')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{authUser.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.email')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{authUser.email}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.university')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{authUser.university}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.department')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">
                {authUser.expertise || t('general.notSpecified') || 'Belirtilmemiş'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.class')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">
                {authUser.grade !== undefined ? 
                  (authUser.grade === 0 ? t('profile.graduate') : 
                   authUser.grade === 1 ? t('profile.firstYear') :
                   authUser.grade === 2 ? t('profile.secondYear') :
                   authUser.grade === 3 ? t('profile.thirdYear') :
                   authUser.grade === 4 ? t('profile.fourthYear') :
                   authUser.grade === 5 ? t('profile.fifthYear') :
                   authUser.grade === 6 ? t('profile.sixthYear') :
                   `${authUser.grade}. ${t('profile.class')}`) 
                  : t('general.notSpecified') || 'Belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
