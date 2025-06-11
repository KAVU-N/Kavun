"use client";

import Link from "next/link";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { FaClock } from "react-icons/fa";

export default function CokYakindaPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF9F5] to-[#FFE5D9] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-lg w-full">
        <FaClock className="text-[#FF8B5E] mb-6" size={64} />
        <h1 className="text-3xl font-bold text-[#994D1C] mb-4">
          {t('comingSoon.title') || "Çok Yakında!"}
        </h1>
        <p className="text-lg text-[#6B3416] mb-6 text-center">
          {t('comingSoon.description') || "Bu sayfa ve özellikler çok yakında aktif olacak. Takipte kalın!"}
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105"
        >
          {t('comingSoon.backToHome') || "Ana Sayfaya Dön"}
        </Link>
      </div>
    </div>
  );
}
