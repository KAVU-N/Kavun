"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { universities } from '@/data/universities';

type Club = {
  _id: string;
  name: string;
  university: string;
  category?: string;
  description?: string;
};

export default function ClubsPage() {
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#994D1C]">Kulüpler</h1>
          <Link
            href="/kulupler/olustur"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#994D1C] text-white px-4 py-2 shadow hover:opacity-95 transition"
          >
            Kulüp Ekle
          </Link>
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input value={q} onChange={e=>setQ(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur placeholder:text-black/50" placeholder="Ara (isim, anahtar kelime)" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur">
            <option value="">Kategori (Tümü)</option>
            {categories.map((c)=>(<option key={c} value={c}>{c}</option>))}
          </select>
          <select value={university} onChange={e=>setUniversity(e.target.value)} className="px-4 py-3 rounded-lg border border-black/10 bg-white/60 backdrop-blur">
            <option value="">Üniversite (Tümü)</option>
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
              <div className="col-span-full text-center text-black/70">Kriterlere uygun kulüp bulunamadı.</div>
            ) : clubs.map((club) => (
              <Link key={club._id} href={`/kulupler/${club._id}`} className="rounded-xl bg-white/70 border border-black/10 p-4 shadow-sm hover:shadow transition">
                <div className="font-semibold text-[#994D1C]">{club.name}</div>
                <div className="text-sm text-black/70">{club.university}{club.category ? ` • ${club.category}` : ''}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
