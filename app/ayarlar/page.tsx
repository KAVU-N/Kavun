'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  university: string;
  isVerified: boolean;
}

export default function AyarlarPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hesap');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/auth/user?id=${user.id}`);
          const data = await response.json();
          
          if (response.ok) {
            console.log('User details:', data.user);
            setUserDetails(data.user);
          } else {
            console.error('Error fetching user details:', data.error);
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  // Debug için
  console.log('Context user:', user);
  console.log('User details:', userDetails);

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-[#FFE5D9]">
            <div className="flex">
              <button
                onClick={() => setActiveTab('hesap')}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'hesap'
                    ? 'text-[#6B3416] border-b-2 border-[#FF8B5E]'
                    : 'text-[#994D1C] hover:text-[#6B3416]'
                }`}
              >
                Hesap Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('guvenlik')}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-300 ${
                  activeTab === 'guvenlik'
                    ? 'text-[#6B3416] border-b-2 border-[#FF8B5E]'
                    : 'text-[#994D1C] hover:text-[#6B3416]'
                }`}
              >
                Güvenlik
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'hesap' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#6B3416]">Hesap Bilgileri</h3>
                  <p className="mt-1 text-sm text-[#994D1C]">
                    Hesap bilgileriniz.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#6B3416]">
                      Ad Soyad
                    </label>
                    <div className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] bg-[#FFF5F0]">
                      {userDetails?.name || 'Yükleniyor...'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B3416]">
                      E-posta
                    </label>
                    <div className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] bg-[#FFF5F0]">
                      {userDetails?.email || 'Yükleniyor...'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B3416]">
                      Üniversite
                    </label>
                    <div className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] bg-[#FFF5F0]">
                      {userDetails?.university || 'Belirtilmemiş'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B3416]">
                      Rol
                    </label>
                    <div className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] bg-[#FFF5F0]">
                      {userDetails?.role === 'student' ? 'Öğrenci' : 'Eğitmen'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guvenlik' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#6B3416]">Şifre Değiştir</h3>
                  <p className="mt-1 text-sm text-[#994D1C]">
                    Hesabınızın güvenliği için şifrenizi değiştirebilirsiniz.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-[#6B3416]">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] shadow-sm focus:border-[#FF8B5E] focus:outline-none focus:ring-1 focus:ring-[#FF8B5E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-[#6B3416]">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] shadow-sm focus:border-[#FF8B5E] focus:outline-none focus:ring-1 focus:ring-[#FF8B5E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-[#6B3416]">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      className="mt-1 block w-full rounded-lg border border-[#FFE5D9] px-3 py-2 text-[#6B3416] shadow-sm focus:border-[#FF8B5E] focus:outline-none focus:ring-1 focus:ring-[#FF8B5E]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium 
                      transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 active:scale-[0.98]"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
