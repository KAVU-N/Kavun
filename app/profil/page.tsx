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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416]">{t('profile.profileInfo')}</h1>
            <Link 
              href="/profil/duzenle" 
              className="px-4 py-2 bg-[#FF9B6A] text-white rounded-lg hover:bg-[#FF8B5E] transition-colors font-medium"
            >
              {t('profile.editProfile')}
            </Link>
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

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">{t('profile.accountStatus')}</h2>
              <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${user.isVerified 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.isVerified ? t('profile.verified') : t('profile.unverified')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
