'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function CreateClubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.university) {
      setUniversity(user.university);
    }
  }, [user?.university]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user?.id) {
      alert('Lütfen giriş yapın.');
      return;
    }
    if (!name.trim()) {
      setError('Lütfen kulüp adını girin.');
      return;
    }
    if (!user?.university) {
      setError('Profilinizde üniversite bilgisi bulunamadı. Lütfen profilinizden üniversitenizi ekleyin.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/kulupler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, university: user.university, category, description, ownerId: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Kaydetme başarısız.');
      }
      router.push(`/kulupler/${data.data._id}`);
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <Link href="/kulupler" className="text-[#994D1C] hover:underline">← Kulüplere dön</Link>
        <form onSubmit={onSubmit} className="mt-4 rounded-2xl bg-white/70 border border-black/10 p-6 shadow space-y-4">
          <h1 className="text-2xl font-bold text-[#994D1C]">Kulüp Ekle</h1>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Kulüp adı" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white" />
          <div>
            <input value={university} disabled placeholder="Üniversite" title="Üniversite bilginiz profilinizden otomatik gelir" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-gray-100 text-black/70" />
            <p className="text-xs text-black/60 mt-1">Üniversite bilginiz profilinizden otomatik alınır ve değiştirilemez.</p>
          </div>
          <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Kategori" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Açıklama" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white min-h-28" />
          <button disabled={loading} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#994D1C] text-white px-4 py-2 shadow hover:opacity-95 transition disabled:opacity-60">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </form>
      </div>
    </div>
  );
}
