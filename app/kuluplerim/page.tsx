"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';

type Club = {
  _id: string;
  name: string;
  university: string;
  category?: string;
  description?: string;
};

export default function MyClubPage() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const categories = useMemo(
    () => ['Genel', 'Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Oyun', 'Veri Bilimi', 'Siber Güvenlik', 'Diğer'],
    []
  );

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/kulupler?ownerId=${encodeURIComponent(user.id)}`, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) {
          const c = (data.data || [])[0] || null;
          setClub(c);
          if (c) {
            setName(c.name || '');
            setCategory(c.category || '');
            setDescription(c.description || '');
          }
          setError(null);
        } else {
          setError(data?.error || 'Kulüp yüklenemedi');
        }
      } catch (_) {
        setError('Kulüp yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [user?.id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setError(null);
    try {
      setSaving(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/kulupler/${club._id}`, {
        method: 'PUT',
        headers: token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Kaydetme başarısız');
      setClub(data.data);
    } catch (err: any) {
      setError(err?.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-[#994D1C]">Kulübüm</h1>
          {!club && <Link href="/kulupler/olustur" className="text-sm text-[#994D1C] underline">Kulüp oluştur</Link>}
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-6 shadow-lg">
          {loading ? (
            <div>Yükleniyor...</div>
          ) : !club ? (
            <p className="text-black/70">Henüz bir kulübünüz yok. Yeni kulüp oluşturabilirsiniz.</p>
          ) : (
            <form onSubmit={onSave} className="space-y-5">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-black/70">Kulüp Adı</label>
                  <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white" />
                </div>
                <div>
                  <label className="text-sm text-black/70">Üniversite</label>
                  <input value={club.university} disabled className="w-full px-4 py-3 rounded-lg border border-black/10 bg-gray-100 text-black/70" />
                </div>
                <div>
                  <label className="text-sm text-black/70">Kategori</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white">
                    <option value="">Seçiniz</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
              </div>
              <div>
                <label className="text-sm text-black/70">Açıklama</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white min-h-32" placeholder="Kulübünüz hakkında kısa bilgi" />
              </div>
              <div className="flex gap-3 justify-end">
                <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#994D1C] text-white px-5 py-2.5 shadow hover:opacity-95 transition disabled:opacity-60">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <Link href={`/kulupler/${club._id}`} className="px-5 py-2.5 rounded-lg border border-black/10 text-[#994D1C] hover:bg-black/5">Detay sayfası</Link>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    if (!club) return;
                    const ok = window.confirm('Kulübünüzü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                    if (!ok) return;
                    setError(null);
                    try {
                      setDeleting(true);
                      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                      const res = await fetch(`/api/kulupler/${club._id}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : undefined });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error || 'Silme başarısız');
                      // Silindikten sonra state'i temizle
                      setClub(null);
                    } catch (err: any) {
                      setError(err?.message || 'Silme başarısız');
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting ? 'Siliniyor...' : 'Kulübü Sil'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
