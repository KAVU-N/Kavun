"use client";
import Link from "next/link";

export default function KaynakPaylasimFailPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="text-red-500 text-5xl mb-4">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#994D1C] mb-4">Yükleme Başarısız!</h2>
        <p className="text-[#6B3416] mb-6">
          Kaynağınızda uygunsuz içerik tespit edildiği için yükleme gerçekleştirilemedi.
        </p>
        <Link href="/kaynaklar/paylas" className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20">
          Kaynak Paylaşımına Dön
        </Link>
      </div>
    </div>
  );
}
