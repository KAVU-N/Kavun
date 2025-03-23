'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Giriş yaparken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0] px-4 py-16 space-y-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#994D1C]">
            Giriş Yap
          </h2>
          <p className="mt-2 text-sm text-[#6B3416]">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors">
              Kayıt Ol
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#6B3416]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#6B3416]">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
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
                Beni Hatırla
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors"
            >
              Şifremi Unuttum
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
            className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}