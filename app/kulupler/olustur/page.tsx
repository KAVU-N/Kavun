'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Image from 'next/image';

export default function CreateClubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      setError(t('general.clubNameRequired'));
      return;
    }
    if (!user?.university) {
      setError('Profilinizde üniversite bilgisi bulunamadı. Lütfen profilinizden üniversitenizi ekleyin.');
      return;
    }
    try {
      setLoading(true);
      let logoUrl: string | undefined = undefined;
      // Token varsa Authorization ekleyeceğiz; yoksa cookie ile devam edilir
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (logoPreview && logoPreview.startsWith('data:')) {
        const resUpload = await fetch('/api/upload/profile-photo', {
          method: 'POST',
          credentials: 'include',
          headers: token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: logoPreview, userId: user.id, purpose: 'club-logo' })
        });
        const dataUpload = await resUpload.json();
        if (!resUpload.ok) {
          throw new Error(dataUpload?.error || 'Logo yüklenemedi');
        }
        logoUrl = dataUpload.url as string;
      }
      const res = await fetch('/api/kulupler', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, university: user.university, category, description, ownerId: user.id, logoUrl })
      });
      const data = await res.json();
      if (!res.ok || res.status !== 201 || !data?.data?._id) {
        throw new Error(data?.error || 'Oluşturma başarısız.');
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
        <Link href="/kulupler" className="text-[#994D1C] hover:underline">← {t('nav.clubs')}</Link>
        <form onSubmit={onSubmit} className="mt-4 rounded-2xl bg-white/70 border border-black/10 p-6 shadow space-y-4">
          <h1 className="text-2xl font-bold text-[#994D1C]">{t('clubs.addClub')}</h1>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('general.clubName')} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white" />
          <div>
            <input value={university} disabled placeholder={t('general.clubUniversity')} title="Üniversite bilginiz profilinizden otomatik gelir" className="w-full px-4 py-3 rounded-lg border border-black/10 bg-gray-100 text-black/70" />
            <p className="text-xs text-black/60 mt-1">Üniversite bilginiz profilinizden otomatik alınır ve değiştirilemez.</p>
          </div>
          <input value={category} onChange={e=>setCategory(e.target.value)} placeholder={t('general.clubCategory')} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={t('general.clubDescription')} className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white min-h-28" />
          {/* Logo yükleme */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-black/80 mb-1">Kulüp Logosu (Maks. 1MB, JPG/PNG/WebP)</label>
            {logoPreview ? (
              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                <Image src={logoPreview} alt="Logo önizleme" fill sizes="640px" className="object-contain" />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const allowed = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowed.includes(file.type)) {
                  setError('Yalnızca JPG, PNG veya WebP yükleyebilirsiniz.');
                  return;
                }
                if (file.size > 1024 * 1024) { // 1MB
                  setError('Kulüp logosu 1MB altında olmalıdır.');
                  return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setLogoPreview(String(ev.target?.result || ''));
                };
                reader.readAsDataURL(file);
              }}
              className="block w-full text-sm text-black/80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFE5D9] file:text-[#994D1C] hover:file:bg-[#FFD8C7]"
            />
          </div>
          <button disabled={loading} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#994D1C] text-white px-4 py-2 shadow hover:opacity-95 transition disabled:opacity-60">{loading ? 'Oluşturuluyor...' : t('general.clubCreate')}</button>
        </form>
      </div>
    </div>
  );
}
