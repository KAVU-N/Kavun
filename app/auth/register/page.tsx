'use client';
import './recaptcha-hide.css';
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from 'react';

// --- ICON BİLEŞENLERİ ---
function CheckIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#22c55e"/><path d="M5 8.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}
function CrossIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#ef4444"/><path d="M5.5 5.5l5 5m0-5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
  );
}

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import Image from 'next/image';
import { universities } from '@/data/universities';
import { departments } from './departments';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { Suspense } from 'react';

function RegisterPageInner() {
  // --- YENİ STATE ---
  const [name, setName] = useState('');
  const [showNameInfo, setShowNameInfo] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- KURALLAR ---
  const nameRuleChecks = {
    capitalized: name.trim().length > 0 && name.trim().split(' ').filter(Boolean).every(word => word[0] && word[0] === word[0]?.toLocaleUpperCase('tr')),
    onlyLetters: name.trim().length > 0 && /^[A-Za-zÇĞİÖŞÜçğıöşü ]+$/.test(name),
    twoWords: name.trim().length > 0 && name.trim().split(' ').filter(Boolean).length >= 2,
  };

  const emailRuleChecks = {
    validFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    correctDomain: email.endsWith('@std.ankaramedipol.edu.tr'),
  };
  const passwordRuleChecks = {
    minLength: password.length >= 8,
    uppercase: /[A-ZÇĞİÖŞÜ]/.test(password),
    lowercase: /[a-zçğıöşü]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(password),
  };

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const RECAPTCHA_SITE_KEY = '6Lcjp1krAAAAACt7yAb1jkBw_Aw48x5O2k3LBJPH';

  useEffect(() => {
    if (!(window as any).grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.onload = () => setRecaptchaReady(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setRecaptchaReady(true);
    }
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const universityFromParam = searchParams?.get('university') || '';
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(universityFromParam);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localUniversities, setLocalUniversities] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [expertise, setExpertise] = useState('');
  const [otherExpertise, setOtherExpertise] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("[DEBUG] Form submit edildi");
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!(window as any).grecaptcha) {
      console.log("[DEBUG] window.grecaptcha YOK");
      setError('reCAPTCHA yüklenemedi. Lütfen sayfayı yenileyin.');
      setLoading(false);
      return;
    }
    const formData = new FormData(e.currentTarget);
    console.log('[DEBUG] grecaptcha.ready çağrılıyor');
    (window as any).grecaptcha.ready(() => {
      console.log('[DEBUG] grecaptcha.ready içi çalıştı');
      (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
        .then((token: string) => {
          console.log('[DEBUG] grecaptcha.execute then, token:', token);
          setRecaptchaToken(token);
          submitWithRecaptcha(token, formData);
        })
        .catch((err: any) => {
          console.log('[DEBUG] grecaptcha.execute catch, hata:', err);
          setError('reCAPTCHA doğrulaması başarısız oldu.');
          setLoading(false);
        });
    });
  };

  const submitWithRecaptcha = async (token: string, formData: FormData) => {
  console.log('[DEBUG] submitWithRecaptcha çağrıldı, token:', token);
    const name = (formData.get('name') as string).trim();
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
    console.log("Backend'e gönderilecek name:", name, JSON.stringify(name));

    if (password !== passwordConfirm) {
      setError(t('errors.passwordsDoNotMatch') || 'Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }
    const emailDomain = email.split('@')[1];
    if (emailDomain !== 'std.ankaramedipol.edu.tr') {
      setError('Sadece @std.ankaramedipol.edu.tr uzantılı e-posta adresleri ile kayıt olabilirsiniz');
      setLoading(false);
      return;
    }
    if (!universities.includes(university)) {
      setError(t('errors.invalidUniversity') || 'Lütfen geçerli bir üniversite seçin');
      setLoading(false);
      return;
    }
    if (!departments.includes(expertise)) {
      setError(t('errors.invalidDepartment') || 'Lütfen geçerli bir bölüm seçin');
      setLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] register fonksiyonu çağrılıyor');
      await register(
        name,
        email,
        password,
        university,
        finalExpertise,
        grade,
        token
      );
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
  }, [universityFromParam, t]);

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
          <div className="relative">
  <label htmlFor="name" className="block text-sm font-medium text-[#6B3416] mb-1 flex items-center gap-1">
    {t('auth.fullName')}
    <span
      className="cursor-pointer group relative"
      tabIndex={0}
      onFocus={() => setShowNameInfo(true)}
      onBlur={() => setShowNameInfo(false)}
      onMouseEnter={() => setShowNameInfo(true)}
      onMouseLeave={() => setShowNameInfo(false)}
    >
      {/* Info Icon */}
      <svg width="16" height="16" fill="currentColor" className="text-[#FF8B5E] inline-block"><circle cx="8" cy="8" r="8" fill="#FF8B5E"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff">i</text></svg>
      {showNameInfo && (
        <div className="absolute left-0 top-6 z-20 bg-white border border-[#FFB996] rounded-md shadow-lg p-3 w-64 text-xs text-[#6B3416] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            {nameRuleChecks.capitalized ? <CheckIcon /> : <CrossIcon />} {t('nameRule.capitalized')}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {nameRuleChecks.onlyLetters ? <CheckIcon /> : <CrossIcon />} {t('nameRule.onlyLetters')}
          </div>
          <div className="flex items-center gap-2">
            {nameRuleChecks.twoWords ? <CheckIcon /> : <CrossIcon />} {t('nameRule.twoWords')}
          </div>
        </div>
      )}
    </span>
  </label>
  <input
    id="name"
    name="name"
    type="text"
    required
    value={name}
    onChange={e => setName(e.target.value)}
    className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
  />
</div>

          <div className="relative">
  <label htmlFor="email" className="block text-sm font-medium text-[#6B3416] mb-1 flex items-center gap-1">
    {t('auth.email')}
    <span
      className="cursor-pointer group relative"
      tabIndex={0}
      onFocus={() => setShowEmailInfo(true)}
      onBlur={() => setShowEmailInfo(false)}
      onMouseEnter={() => setShowEmailInfo(true)}
      onMouseLeave={() => setShowEmailInfo(false)}
    >
      <svg width="16" height="16" fill="currentColor" className="text-[#FF8B5E] inline-block"><circle cx="8" cy="8" r="8" fill="#FF8B5E"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff">i</text></svg>
      {showEmailInfo && (
        <div className="absolute left-0 top-6 z-20 bg-white border border-[#FFB996] rounded-md shadow-lg p-3 w-64 text-xs text-[#6B3416] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            {emailRuleChecks.validFormat ? <CheckIcon /> : <CrossIcon />} {t('emailRule.validFormat')}
          </div>
          <div className="flex items-center gap-2">
            {emailRuleChecks.correctDomain ? <CheckIcon /> : <CrossIcon />} {t('emailRule.correctDomain')}
          </div>
        </div>
      )}
    </span>
  </label>
  <input
    id="email"
    name="email"
    type="email"
    required
    value={email}
    onChange={e => setEmail(e.target.value)}
    className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-3 py-1.5"
  />
</div>

          <div className="relative">
  <label htmlFor="password" className="block text-sm font-medium text-[#6B3416] mb-1 flex items-center gap-1">
    {t('auth.password')}
    <span
      className="cursor-pointer group relative"
      tabIndex={0}
      onFocus={() => setShowPasswordInfo(true)}
      onBlur={() => setShowPasswordInfo(false)}
      onMouseEnter={() => setShowPasswordInfo(true)}
      onMouseLeave={() => setShowPasswordInfo(false)}
    >
      <svg width="16" height="16" fill="currentColor" className="text-[#FF8B5E] inline-block"><circle cx="8" cy="8" r="8" fill="#FF8B5E"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff">i</text></svg>
      {showPasswordInfo && (
        <div className="absolute left-0 top-6 z-20 bg-white border border-[#FFB996] rounded-md shadow-lg p-3 w-64 text-xs text-[#6B3416] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            {passwordRuleChecks.minLength ? <CheckIcon /> : <CrossIcon />} {t('passwordRule.minLength')}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {passwordRuleChecks.uppercase ? <CheckIcon /> : <CrossIcon />} {t('passwordRule.uppercase')}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {passwordRuleChecks.lowercase ? <CheckIcon /> : <CrossIcon />} {t('passwordRule.lowercase')}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {passwordRuleChecks.digit ? <CheckIcon /> : <CrossIcon />} {t('passwordRule.digit')}
          </div>
          <div className="flex items-center gap-2">
            {passwordRuleChecks.special ? <CheckIcon /> : <CrossIcon />} {t('passwordRule.special')}
          </div>
        </div>
      )}
    </span>
  </label>
  <input
    id="password"
    name="password"
    type="password"
    required
    minLength={8}
    value={password}
    onChange={e => setPassword(e.target.value)}
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

          {/* Google reCAPTCHA badge yasal olarak gizleniyor, açıklama ve linkler ekleniyor */}
          <div className="text-xs text-center text-gray-500 mt-2">
            Bu site Google reCAPTCHA ile korunmaktadır.<br />
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Gizlilik Politikası</a> ve 
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline ml-1">Kullanım Şartları</a> geçerlidir.
          </div>
          
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
