'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface ClubOption {
  _id: string;
  name: string;
  university?: string;
}

export default function EventAdminAddPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [resourcesText, setResourcesText] = useState('');
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;
    const loadClubs = async () => {
      try {
        setLoadingClubs(true);
        const response = await fetch('/api/kulupler?limit=200');
        if (!response.ok) {
          throw new Error('Failed to load clubs');
        }
        const data = await response.json();
        if (!ignore) {
          setClubs(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (error: any) {
        if (!ignore) {
          toast.error(error?.message || t('events.admin.loadClubsError'));
        }
      } finally {
        if (!ignore) {
          setLoadingClubs(false);
        }
      }
    };

    loadClubs();
    return () => {
      ignore = true;
    };
  }, [t]);

  const resourceList = useMemo(() => {
    return resourcesText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [resourcesText]);

  const handleToggleClub = (clubId: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!date) {
      toast.error(t('events.admin.dateRequired'));
      return;
    }
    if (selectedClubIds.length === 0) {
      toast.error(t('events.admin.selectClubError'));
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
        clubIds: selectedClubIds,
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
      setSelectedClubIds([]);
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
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  />
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
              {loadingClubs ? (
                <div className="text-sm text-[#C17B4C] animate-pulse">
                  {t('events.admin.loadingClubs')}
                </div>
              ) : clubs.length === 0 ? (
                <div className="text-sm text-[#C17B4C]">
                  {t('events.admin.noClubs')}
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {clubs.map((club) => {
                    const inputId = `club-${club._id}`;
                    const checked = selectedClubIds.includes(club._id);
                    return (
                      <label
                        key={club._id}
                        htmlFor={inputId}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition cursor-pointer ${
                          checked
                            ? 'border-[#FF8B5E] bg-[#FFF0E6]'
                            : 'border-[#FFE5D9] hover:border-[#FFB996] hover:bg-[#FFF8F4]'
                        }`}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleClub(club._id)}
                          className="mt-1 h-4 w-4 rounded border-[#FFE5D9] text-[#FF8B5E] focus:ring-[#FF8B5E]"
                        />
                        <div className="text-sm leading-5 text-[#6B3416]">
                          <div className="font-semibold">{club.name}</div>
                          {club.university && (
                            <div className="text-xs text-[#C17B4C]">{club.university}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

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
