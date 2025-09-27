"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { universities } from '@/data/universities';
import ClubContactActions from '@/src/components/ClubContactActions';

type Club = {
  _id: string;
  name: string;
  university: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
};

export default function ClubsPage() {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);

  const categories = useMemo(
    () => ['Genel', 'Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Oyun', 'Veri Bilimi', 'Siber Güvenlik', 'Diğer'],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (category) params.set('category', category);
        if (university) params.set('university', university);
        const res = await fetch(`/api/kulupler?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) setClubs(data.data || []);
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
    return () => controller.abort();
  }, [q, category, university]);

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{t('clubs.title')}</h1>
          <Link
            href="/kulupler/olustur"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#994D1C] text-white px-4 py-2 shadow hover:opacity-95 transition"
          >
            {t('clubs.addClub')}
          </Link>
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input value={q} onChange={e=>setQ(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur placeholder:text-black/50" placeholder={t('clubs.searchPlaceholder')} />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur">
            <option value="">{t('clubs.categoryAll')}</option>
            {categories.map((c)=>(<option key={c} value={c}>{c}</option>))}
          </select>
          <select value={university} onChange={e=>setUniversity(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur">
            <option value="">{t('clubs.universityAll')}</option>
            {universities.map((u)=>(<option key={u} value={u}>{u}</option>))}
          </select>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-xl bg-white/70 border border-black/10 p-4 shadow-sm animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.length === 0 ? (
              <div className="col-span-full text-center text-black/70">{t('clubs.noResults')}</div>
            ) : clubs.map((club) => (
              <div key={club._id} className="relative rounded-xl bg-white/70 border border-black/10 p-4 pb-16 shadow-sm hover:shadow transition flex items-start gap-3">
                <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-sm text-black/50">
                  {club.logoUrl ? (
                    <Image src={club.logoUrl} alt={`${club.name} logo`} width={48} height={48} className="w-12 h-12 object-cover" />
                  ) : (
                    club.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/kulupler/${club._id}`} className="block">
                    <div className="font-semibold text-[#994D1C] line-clamp-1">{club.name}</div>
                    <div className="text-sm text-black/70 line-clamp-1">{club.university}{club.category ? ` • ${club.category}` : ''}</div>
                  </Link>
                  <div className="absolute bottom-3 right-3">
                    <ClubContactActions ownerId={club.ownerId} university={club.university} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
