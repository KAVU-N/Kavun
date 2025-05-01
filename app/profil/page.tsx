'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, setUser } = useAuth();
  const [user, setProfileUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/auth/login');
      return;
    }
    
    if (authUser) {
      // AuthContext'ten gelen kullanıcı bilgilerini kullan
      setProfileUser(authUser);
      setLoading(false);
    }
  }, [authUser, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB996]"></div>
              <span className="ml-3 text-[#994D1C]">{t('general.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EEE8FC]">
          {/* Modern üst blok */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <div className="text-xs tracking-widest text-[#6B3416] font-semibold uppercase mb-1">{user.role === 'student' ? t('auth.student') : t('auth.instructor')}</div>
              <div className="text-2xl md:text-3xl font-bold text-[#6B3416]">{user.name}</div>
            </div>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-8 border border-[#EEE8FC]">
              {/* Profil fotoğrafı yükleme alanı */}
              <div className="relative flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-[#191921] flex items-center justify-center text-white text-4xl font-bold border-4 border-[#FF9B6A]" style={{letterSpacing: '2px'}}>
                  {(user as any).profilePhotoUrl ? (
                    <img src={(user as any).profilePhotoUrl} alt="Profil Fotoğrafı" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
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
          <div className="mb-6">
            <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.accountStatus')}</h2>
            <div className="mt-1 text-lg text-[#6B3416] flex items-center gap-4">
              {user.isVerified ? (
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
                        body: JSON.stringify({ email: user.email })
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

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.fullName')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.email')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.email}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.university')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.university}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.role')}</h2>
              <p className="mt-1 text-lg text-[#6B3416] capitalize">
                {user.role === 'student' ? t('auth.student') : t('auth.instructor')}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.department')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">
                {user.expertise || t('general.notSpecified') || 'Belirtilmemiş'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.class')}</h2>
              <p className="mt-1 text-lg text-[#6B3416]">
                {user.grade !== undefined ? 
                  (user.grade === 0 ? t('profile.graduate') : 
                   user.grade === 1 ? t('profile.firstYear') :
                   user.grade === 2 ? t('profile.secondYear') :
                   user.grade === 3 ? t('profile.thirdYear') :
                   user.grade === 4 ? t('profile.fourthYear') :
                   user.grade === 5 ? t('profile.fifthYear') :
                   user.grade === 6 ? t('profile.sixthYear') :
                   `${user.grade}. ${t('profile.class')}`) 
                  : t('general.notSpecified') || 'Belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
