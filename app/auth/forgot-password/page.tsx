'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#994D1C] text-center">
          Şifremi Unuttum
        </h2>
        <p className="mt-2 text-sm text-[#6B3416] text-center">
          Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="text-[#994D1C] font-medium">
            Şifre sıfırlama bağlantısı email adresinize gönderildi.
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
            <label htmlFor="email" className="block text-sm font-medium text-[#6B3416]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
