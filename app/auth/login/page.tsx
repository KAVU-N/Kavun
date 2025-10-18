'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import Image from 'next/image';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || t('errors.loginError') || 'Giriş yaparken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col md:flex-row items-center justify-center gap-12 py-16 px-6">
      <div className="relative w-full max-w-md">
        <Image
          src="/images/education-illustration.svg"
          alt="Education"
          width={500}
          height={500}
          priority
        />
      </div>

      <div className="w-full max-w-lg px-2 md:px-0">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFF0E5] drop-shadow">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-sm text-white/90">
            <Link
              href="/auth/register"
              className="text-white font-medium underline-offset-4 hover:underline"
            >
              {t('auth.noAccount')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#6B3416] mb-1">
              {t('auth.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
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
              className="block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 px-4 py-3"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-[#FFB996] text-[#FF8B5E] focus:ring-[#FF8B5E]"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-[#6B3416]">
                {t('auth.rememberMe')}
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-[#994D1C] hover:text-[#FF8B5E] transition-colors"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {loading ? t('auth.loggingIn') || 'Giriş Yapılıyor...' : t('auth.login')}
          </button>

          
        </form>
      </div>
    </div>
  );
}