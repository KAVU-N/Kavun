'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function EventAdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/events/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.error || t('events.admin.loginError'));
        return;
      }
      toast.success(t('events.admin.loginSuccess'));
      router.push('/events-admin/add');
    } catch (error: any) {
      toast.error(error?.message || t('events.admin.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0] px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#FFE5D9] p-8">
        <h1 className="text-2xl font-semibold text-[#994D1C] mb-6 text-center">
          {t('events.admin.loginTitle')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#6B3416]">
              {t('events.admin.emailLabel')}
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
              placeholder={t('events.admin.emailPlaceholder')}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#6B3416]">
              {t('events.admin.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
              placeholder={t('events.admin.passwordPlaceholder')}
              autoComplete="off"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-2.5 shadow transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {loading ? t('events.admin.loggingIn') : t('events.admin.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
