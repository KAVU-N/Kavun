'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { universities } from '@/data/universities';
import { departments } from './departments';
import { useLanguage } from '@/src/contexts/LanguageContext';

type Role = 'student' | 'instructor';

import { Suspense } from 'react';
import RegisterCaptcha from '@/src/components/RegisterCaptcha';

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams?.get('role') as Role || 'student';
  const universityFromParam = searchParams?.get('university') || '';
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(universityFromParam);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localUniversities, setLocalUniversities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole); // searchParams null olabilir, ?. ile güvenli erişim
  const [expertise, setExpertise] = useState('');
  const [otherExpertise, setOtherExpertise] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!captchaVerified) {
      setError('Lütfen robot olmadığınızı doğrulayın.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    const university = formData.get('university') as string;
    const gradeValue = formData.get('grade') as string;
    const grade = gradeValue ? parseInt(gradeValue) : undefined;
    let finalExpertise = expertise;
    if (expertise === 'Diğer') {
      finalExpertise = otherExpertise;
    }
    console.log("Formdan seçilen rol:", selectedRole);

    let isValid = true;
    
    // Password match validation
    if (password !== passwordConfirm) {
      setError(t('errors.passwordsDoNotMatch') || 'Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }
    
    // Email domain validation
    const emailDomain = email.split('@')[1];
    if (emailDomain !== 'std.ankaramedipol.edu.tr') {
      setError('Sadece @std.ankaramedipol.edu.tr uzantılı e-posta adresleri ile kayıt olabilirsiniz');
      setLoading(false);
      return;
    }
    
    // University validation
    if (!universities.includes(university)) {
      setError(t('errors.invalidUniversity') || 'Lütfen geçerli bir üniversite seçin');
      setLoading(false);
      return;
    }
    
    // Department validation
    if (!departments.includes(expertise)) {
      setError(t('errors.invalidDepartment') || 'Lütfen geçerli bir bölüm seçin');
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password, role: selectedRole, university, expertise: finalExpertise, grade });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || t('errors.registrationError') || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLocalUniversities(universities);
        if (universityFromParam) {
          setSearchTerm(universityFromParam);
          setSelectedUniversity(universityFromParam);
        }
      } catch (error) {
        console.error(t('errors.loadingUniversities') || 'Üniversiteler yüklenirken hata oluştu:', error);
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
            alt="Register Illustration"
            width={400}
            height={400}
            className="object-contain"
            priority
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-[#994D1C]">
            {t('auth.register')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.fullName')}
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
              {t('auth.email')}
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
              {t('auth.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
            />
            <p className="mt-1 text-xs text-[#6B3416]">{t('auth.passwordRequirement')}</p>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.confirmPassword')}
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

          {/* Captcha Alanı */}
          <RegisterCaptcha onVerify={setCaptchaVerified} />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.role')}
            </label>
            <select
              id="role"
              name="role"
              required
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5 appearance-none bg-white"
            >
              <option value="student">{t('auth.student')}</option>
              <option value="instructor">{t('auth.instructor')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="university" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.university')}
            </label>
            <div className="relative">
              <input
                id="university"
                name="university"
                type="text"
                required
                placeholder={t('auth.selectUniversity')}
                value={selectedUniversity}
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

          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.department')}
            </label>
            <div className="relative">
              <input
                id="expertise"
                name="expertise"
                type="text"
                required
                autoComplete="off"
                placeholder={t('auth.departmentPlaceholder')}
                value={expertise}
                onChange={e => {
                  setExpertise(e.target.value);
                  setShowDepartmentDropdown(true);
                }}
                onFocus={() => setShowDepartmentDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowDepartmentDropdown(false), 200);
                }}
                className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
              />
              {showDepartmentDropdown && (
                <div
                  className="absolute w-full mt-1 bg-white border border-[#FFE5D9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                  {departments.filter(dep =>
                    dep.toLocaleLowerCase('tr').includes(expertise.toLocaleLowerCase('tr'))
                  ).slice(0, 10).map((dep, idx) => (
                    <div
                      key={idx}
                      className="group px-4 py-3 hover:bg-gradient-to-r hover:from-[#FFE5D9] hover:to-[#FFF5F0] cursor-pointer transition-all duration-200"
                      onClick={() => {
                        setExpertise(dep); // Orijinal haliyle input'a yazılır
                        setShowDepartmentDropdown(false);
                      }}
                    >
                      <div className="transition-colors duration-200 text-[#994D1C] group-hover:text-[#6B3416]">
                        {dep}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.class')}
            </label>
            <select
              id="grade"
              name="grade"
              required
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
              defaultValue=""
            >
              <option value="" disabled>{t('auth.selectClass')}</option>
              <option value="preparatory">{t('profile.preparatory')}</option>
              <option value="1">{t('profile.firstYear')}</option>
              <option value="2">{t('profile.secondYear')}</option>
              <option value="3">{t('profile.thirdYear')}</option>
              <option value="4">{t('profile.fourthYear')}</option>
              <option value="5">{t('profile.fifthYear')}</option>
              <option value="6">{t('profile.sixthYear')}</option>
              <option value="0">{t('profile.graduate')}</option>
            </select>
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
            {loading ? t('auth.registering') || 'Kayıt Yapılıyor...' : t('auth.register')}
          </button>
          
          <p className="mt-2 text-xs text-center text-[#6B3416]">
            {t('auth.termsAgreement') || 'By signing up, you agree to our'} <a href="#" className="text-[#FF8B5E] hover:text-[#994D1C]">{t('auth.termsOfUse') || 'Terms of Use'}</a> {t('auth.and') || 'and'} <a href="#" className="text-[#FF8B5E] hover:text-[#994D1C]">{t('auth.privacyPolicy') || 'Privacy Policy'}</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}