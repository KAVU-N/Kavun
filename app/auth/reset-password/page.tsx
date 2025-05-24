'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-[#994D1C] font-medium">
          Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-[#FF8B5E] hover:text-[#994D1C] transition-colors font-medium"
        >
          Yeni şifre sıfırlama bağlantısı talep et
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#994D1C] text-center">
          Şifre Sıfırlama
        </h2>
        <p className="mt-2 text-sm text-[#6B3416] text-center">
          Lütfen yeni şifrenizi girin.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="text-[#994D1C] font-medium">
            Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
          </div>
          <Link
            href="/auth/login"
            className="text-[#FF8B5E] hover:text-[#994D1C] transition-colors font-medium"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#6B3416]">
              Yeni Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            />
            <p className="mt-1 text-sm text-[#994D1C]">En az 8 karakter olmalıdır</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#6B3416]">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            />
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
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      )}
    </div>
  );
}
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}