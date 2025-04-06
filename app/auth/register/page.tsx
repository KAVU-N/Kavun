'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { universities } from '@/data/universities';

type Role = 'student' | 'teacher';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as Role || 'student';
  const universityFromParam = searchParams.get('university') || '';
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(universityFromParam);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localUniversities, setLocalUniversities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    const university = formData.get('university') as string;
    
    console.log("Formdan seçilen rol:", selectedRole);
    
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }
    
    try {
      // URL parametresindeki rol yerine state'te tutulan rolü kullan
      await register({ name, email, password, role: selectedRole, university });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Veritabanından üniversiteleri getiren kod
    const fetchUniversities = async () => {
      try {
        // Data dosyasından üniversiteleri kullanıyoruz
        setLocalUniversities(universities);
        
        if (universityFromParam) {
          setSearchTerm(universityFromParam);
          setSelectedUniversity(universityFromParam);
        }
      } catch (error) {
        console.error('Üniversiteler yüklenirken hata oluştu:', error);
      }
    };

    fetchUniversities();
  }, [universityFromParam]);

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-4">
      {/* Illustration on the left */}
      <div className="hidden md:flex md:flex-1 items-center justify-center">
        <div className="relative w-full max-w-sm">
          <Image 
            src="/images/education-illustration.svg" 
            alt="Education" 
            width={380} 
            height={380} 
            className="object-contain"
          />
        </div>
      </div>
      
      {/* Form on the right */}
      <div className="flex-1">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-[#994D1C]">
            Kayıt Ol
          </h2>
          <p className="mt-1 text-xs text-[#6B3416]">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#6B3416] mb-1">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#6B3416] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#6B3416] mb-1">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
            />
            <p className="mt-1 text-xs text-[#6B3416]">En az 8 karakter olmalıdır</p>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[#6B3416] mb-1">
              Şifre Tekrar
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              minLength={8}
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#6B3416] mb-1">
              Rol
            </label>
            <select
              id="role"
              name="role"
              required
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5 appearance-none bg-white"
            >
              <option value="student">Öğrenci</option>
              <option value="teacher">Öğretmen</option>
            </select>
          </div>

          <div>
            <label htmlFor="university" className="block text-sm font-medium text-[#6B3416] mb-1">
              Üniversite
            </label>
            <div className="relative">
              <input
                id="university"
                name="university"
                type="text"
                required
                placeholder="Üniversitenizi seçin..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  setSelectedUniversity(e.target.value);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
              />
              {showDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute w-full mt-1 bg-white border border-[#FFE5D9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                  {localUniversities.filter(uni => 
                    uni.toLowerCase().includes(searchTerm.toLowerCase())
                  ).slice(0, 10).map((uni, index) => (
                    <div
                      key={index}
                      className={`group px-4 py-3 hover:bg-gradient-to-r hover:from-[#FFE5D9] hover:to-[#FFF5F0] cursor-pointer transition-all duration-200
                        ${index === activeIndex ? 'bg-gradient-to-r from-[#FFE5D9] to-[#FFF5F0]' : ''}`}
                      onClick={() => {
                        setSearchTerm(uni);
                        setSelectedUniversity(uni);
                        setShowDropdown(false);
                      }}
                    >
                      <div className={`transition-colors duration-200
                        ${index === activeIndex ? 'text-[#6B3416]' : 'text-[#994D1C] group-hover:text-[#6B3416]'}`}>
                        {uni}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9B6A] text-white font-semibold py-1.5 px-4 rounded-md hover:bg-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 mt-1"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
          
          <p className="mt-2 text-xs text-center text-[#6B3416]">
            By signing up, you agree to our <a href="#" className="text-[#FF8B5E] hover:text-[#994D1C]">Terms of Use</a> and <a href="#" className="text-[#FF8B5E] hover:text-[#994D1C]">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}