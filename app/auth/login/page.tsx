'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || t('errors.loginError') || 'Giriş yaparken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-8">
      {/* Illustration on the left */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <Image 
            src="/images/education-illustration.svg" 
            alt="Education" 
            width={500} 
            height={500} 
            className="object-contain"
          />
        </div>
      </div>
      
      {/* Form on the right */}
      <div className="flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#994D1C]">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-sm text-[#6B3416]">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/register" className="font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors">
              {t('auth.register')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="text-sm font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors"
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
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#FFB996]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#6B3416]">{t('auth.otherSignInOptions') || 'Other sign in options'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button type="button" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#FFB996] shadow-sm bg-white text-sm font-medium text-[#FF8B5E] hover:bg-[#FFF5F0]">
                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                </svg>
              </button>
              <button type="button" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#FFB996] shadow-sm bg-white text-sm font-medium text-[#FF8B5E] hover:bg-[#FFF5F0]">
                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </button>
              <button type="button" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#FFB996] shadow-sm bg-white text-sm font-medium text-[#FF8B5E] hover:bg-[#FFF5F0]">
                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}