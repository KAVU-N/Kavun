'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function EventAdminAddPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [resourcesText, setResourcesText] = useState('');
  const [clubName, setClubName] = useState('');

  const categoryOptions = useMemo(() => ['Konser', 'Eğitim', 'Konferans', 'Uzaktan', 'Buluşma'], []);
  const categoryPlaceholder = useMemo(() => {
    const value = t('events.admin.categoryPlaceholder');
    return value && value !== 'events.admin.categoryPlaceholder' ? value : 'Kategori seçin';
  }, [t]);
  const clubNameLabel = useMemo(() => {
    const value = t('events.admin.clubNameLabel');
    return value && value !== 'events.admin.clubNameLabel' ? value : 'Kulüp Adı (Opsiyonel)';
  }, [t]);
  const clubNamePlaceholder = useMemo(() => {
    const value = t('events.admin.clubNamePlaceholder');
    return value && value !== 'events.admin.clubNamePlaceholder' ? value : 'Kulüp adını yazın (opsiyonel)';
  }, [t]);

  const resourceList = useMemo(() => {
    return resourcesText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [resourcesText]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!date) {
      toast.error(t('events.admin.dateRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        date,
        category,
        location,
        photoUrl,
        resources: resourceList,
        clubName,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed');
      }

      toast.success(t('events.admin.createSuccess'));
      setTitle('');
      setDate('');
      setDescription('');
      setCategory('');
      setLocation('');
      setPhotoUrl('');
      setResourcesText('');
      setClubName('');
    } catch (error: any) {
      toast.error(error?.message || t('events.admin.createError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/events/admin-logout', { method: 'POST' });
    } finally {
      router.replace('/events-admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-[#994D1C]">
            {t('events.admin.addTitle')}
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-[#FFE5D9] px-4 py-2 text-sm font-medium text-[#994D1C] shadow hover:bg-[#FFDAC8] transition"
          >
            {t('events.admin.logoutButton')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[#FFE5D9] p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">
                  {t('events.admin.titleLabel')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6B3416]">
                    {t('events.admin.dateLabel')}
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6B3416]">
                    {t('events.admin.categoryLabel')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] bg-white"
                    required
                  >
                    <option value="">{categoryPlaceholder}</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6B3416]">
                    {t('events.admin.locationLabel')}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#6B3416]">
                    {t('events.admin.photoLabel')}
                  </label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">
                  {t('events.admin.descriptionLabel')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">
                  {t('events.admin.resourcesLabel')}
                  <span className="text-xs text-[#C17B4C] block">
                    {t('events.admin.resourcesHint')}
                  </span>
                </label>
                <textarea
                  value={resourcesText}
                  onChange={(e) => setResourcesText(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] min-h-[100px]"
                  placeholder={t('events.admin.resourcesPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#994D1C]">
                {t('events.admin.clubSelectTitle')}
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]" htmlFor="clubName">
                  {clubNameLabel}
                </label>
                <input
                  id="clubName"
                  type="text"
                  value={clubName}
                  onChange={(event) => setClubName(event.target.value)}
                  placeholder={clubNamePlaceholder}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                />
                <span className="text-xs text-[#C17B4C] block">
                  {t('events.admin.clubNameHint') ?? 'Eğer belirli bir kulüp adına bağlıysa buraya yazabilirsiniz.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-2.5 shadow transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {saving ? t('events.admin.saving') : t('events.admin.saveButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
