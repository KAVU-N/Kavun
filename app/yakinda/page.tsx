'use client';

import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function ComingSoonPage() {
  const { t } = useLanguage();
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white/80 backdrop-blur border border-black/10 rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#994D1C] mb-3">
            {t('comingSoon.title')}
          </h1>
          <p className="text-[#6B3416] mb-6">
            {t('comingSoon.description')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white px-5 py-3 shadow hover:opacity-95 transition"
          >
            {t('comingSoon.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
