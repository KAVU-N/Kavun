'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { toast } from 'react-hot-toast';

interface ClubItem {
  _id: string;
  name: string;
  university: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  isApproved?: boolean;
  createdAt?: string;
}

const categories = ['Genel', 'Web', 'Mobil', 'Masaüstü', 'Yapay Zeka', 'Oyun', 'Veri Bilimi', 'Siber Güvenlik', 'Diğer'];

export default function AdminClubsPage() {
  const { t } = useLanguage();
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      if (filterUniversity) params.set('university', filterUniversity);
      if (filterCategory) params.set('category', filterCategory);

      const response = await fetch(`/api/kulupler?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Kulüpler yüklenemedi');
      }
      setClubs(Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      setError(err?.message || 'Kulüpler yüklenemedi');
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterUniversity, filterCategory]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const universities = useMemo(() => {
    const set = new Set<string>();
    clubs.forEach((club) => {
      if (club.university) set.add(club.university);
    });
    return Array.from(set).sort();
  }, [clubs]);

  const openEdit = (club: ClubItem) => {
    setSelectedClub(club);
    setIsEditing(true);
  };

  const resetEdit = () => {
    setIsEditing(false);
    setSelectedClub(null);
    setSaving(false);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClub) return;

    if (!selectedClub.name.trim()) {
      toast.error('Kulüp adı boş olamaz');
      return;
    }
    if (!selectedClub.university.trim()) {
      toast.error('Üniversite boş olamaz');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/clubs/${selectedClub._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedClub),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Kulüp güncellenemedi');
      }

      setClubs((prev) => prev.map((item) => (item._id === selectedClub._id ? data.data : item)));
      toast.success('Kulüp güncellendi');
      resetEdit();
    } catch (err: any) {
      toast.error(err?.message || 'Kulüp güncellenemedi');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kulübü silmek istediğinize emin misiniz?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/clubs/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Kulüp silinemedi');
      }
      setClubs((prev) => prev.filter((item) => item._id !== id));
      toast.success('Kulüp silindi');
    } catch (err: any) {
      toast.error(err?.message || 'Kulüp silinemedi');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">{t('adminClubs')}</h1>
          <p className="text-sm text-blue-100/80">{t('adminClubs.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kulüp ara..."
            className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filterUniversity}
            onChange={(e) => setFilterUniversity(e.target.value)}
            className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tüm Üniversiteler</option>
            {universities.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Link
            href="/kulupler/olustur"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            {t('adminClubs.addButton')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : clubs.length === 0 ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Kulüp bulunamadı.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow">
          <table className="min-w-full divide-y divide-blue-100 text-sm">
            <thead className="bg-blue-50 text-blue-900 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Kulüp</th>
                <th className="px-4 py-3 text-left">Üniversite</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Onay</th>
                <th className="px-4 py-3 text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {clubs.map((club) => (
                <tr key={club._id} className="hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-blue-900">{club.name}</div>
                    {club.description ? (
                      <div className="text-xs text-blue-500 line-clamp-2">{club.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-blue-900">{club.university}</td>
                  <td className="px-4 py-3 text-blue-900">{club.category || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${club.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {club.isApproved ? 'Onaylı' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(club)}
                        className="rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(club._id)}
                        disabled={deletingId === club._id}
                        className="rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60"
                      >
                        {deletingId === club._id ? '...' : 'Sil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditing && selectedClub ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-900">Kulüp Düzenle</h2>
              <button
                type="button"
                onClick={resetEdit}
                className="text-sm font-medium text-blue-500 hover:text-blue-700"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-blue-900">
                <span>Kulüp Adı</span>
                <input
                  type="text"
                  value={selectedClub.name}
                  onChange={(e) => setSelectedClub({ ...selectedClub, name: e.target.value })}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </label>

              <label className="space-y-1 text-sm text-blue-900">
                <span>Üniversite</span>
                <input
                  type="text"
                  value={selectedClub.university}
                  onChange={(e) => setSelectedClub({ ...selectedClub, university: e.target.value })}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </label>

              <label className="space-y-1 text-sm text-blue-900">
                <span>Kategori</span>
                <select
                  value={selectedClub.category ?? ''}
                  onChange={(e) => setSelectedClub({ ...selectedClub, category: e.target.value || undefined })}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-blue-900">
                <span>Onay Durumu</span>
                <select
                  value={selectedClub.isApproved ? 'true' : 'false'}
                  onChange={(e) => setSelectedClub({ ...selectedClub, isApproved: e.target.value === 'true' })}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="true">Onaylı</option>
                  <option value="false">Beklemede</option>
                </select>
              </label>

              <div className="md:col-span-2 space-y-1 text-sm text-blue-900">
                <span>Açıklama</span>
                <textarea
                  value={selectedClub.description ?? ''}
                  onChange={(e) => setSelectedClub({ ...selectedClub, description: e.target.value })}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetEdit}
                  className="rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
