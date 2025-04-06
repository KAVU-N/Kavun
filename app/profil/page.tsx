'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB996]"></div>
              <span className="ml-3 text-[#994D1C]">Yükleniyor...</span>
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
          <h1 className="text-3xl font-bold text-[#6B3416] mb-8">Profil Bilgileri</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">Ad Soyad</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">E-posta</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.email}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">Üniversite</h2>
              <p className="mt-1 text-lg text-[#6B3416]">{user.university}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">Rol</h2>
              <p className="mt-1 text-lg text-[#6B3416] capitalize">
                {user.role === 'student' ? 'Öğrenci' : 'Öğretmen'}
              </p>
            </div>

            {user.role === 'teacher' && (
              <div>
                <h2 className="text-sm font-medium text-[#994D1C]">Verdiği Ders / Uzmanlık Alanı</h2>
                <p className="mt-1 text-lg text-[#6B3416]">
                  {user.expertise || 'Belirtilmemiş'}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-[#994D1C]">Hesap Durumu</h2>
              <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${user.isVerified 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
