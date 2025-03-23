'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { universities } from '@/data/universities';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const role = formData.get('role') as 'student' | 'teacher';
    const university = formData.get('university') as string;

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      const result = await register({ name, email, password, role, university });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0] px-4 py-16 space-y-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#994D1C]">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-sm text-[#6B3416]">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="font-medium text-[#FF8B5E] hover:text-[#994D1C] transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#6B3416]">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            />
          </div>

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
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#6B3416]">
              Rol
            </label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            >
              <option value="">Rol seçin</option>
              <option value="student">Öğrenci</option>
              <option value="teacher">Eğitmen</option>
            </select>
          </div>

          <div>
            <label htmlFor="university" className="block text-sm font-medium text-[#6B3416]">
              Üniversite
            </label>
            <select
              id="university"
              name="university"
              required
              className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
            >
              <option value="">Üniversite seçin</option>
              {universities.map((university, index) => (
                <option key={index} value={university}>
                  {university}
                </option>
              ))}
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
            className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
      </div>
    </div>
  );
}