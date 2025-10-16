'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface EventClub {
  _id?: string;
  name?: string;
  university?: string;
  category?: string;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  location?: string;
  photoUrl?: string;
  resources?: string[];
  clubs?: EventClub[];
  clubName?: string;
}

const toDatetimeLocal = (iso?: string) => {
  if (!iso) return '';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '';
  const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const normalizeResourcesText = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export default function EventsAdminPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editResources, setEditResources] = useState('');
  const [editClubName, setEditClubName] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load events');
      }
      setEvents(Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const formattedEvents = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return events.map((event) => {
      const dateValue = new Date(event.date);
      const formattedDate = Number.isNaN(dateValue.getTime()) ? event.date : formatter.format(dateValue);
      return { ...event, formattedDate };
    });
  }, [events, language]);

  const handleOpenEdit = (event: EventItem) => {
    setSelectedEvent(event);
    setEditTitle(event.title ?? '');
    setEditDate(toDatetimeLocal(event.date));
    setEditDescription(event.description ?? '');
    setEditCategory(event.category ?? '');
    setEditLocation(event.location ?? '');
    setEditPhotoUrl(event.photoUrl ?? '');
    setEditResources((event.resources ?? []).join('\n')); 
    setEditClubName(event.clubName ?? '');
    setEditing(true);
  };

  const resetEditState = () => {
    setSelectedEvent(null);
    setEditing(false);
    setSaving(false);
    setEditTitle('');
    setEditDate('');
    setEditDescription('');
    setEditCategory('');
    setEditLocation('');
    setEditPhotoUrl('');
    setEditResources('');
    setEditClubName('');
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEvent) return;
    if (!editTitle.trim()) {
      toast.error(t('events.admin.titleLabel'));
      return;
    }
    if (!editDescription.trim()) {
      toast.error(t('events.admin.descriptionLabel'));
      return;
    }
    if (!editDate) {
      toast.error(t('events.admin.dateRequired'));
      return;
    }

    const isoDate = new Date(editDate);
    if (Number.isNaN(isoDate.getTime())) {
      toast.error(t('events.admin.updateError'));
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        date: isoDate.toISOString(),
        category: editCategory.trim(),
        location: editLocation.trim(),
        photoUrl: editPhotoUrl.trim(),
        resources: normalizeResourcesText(editResources),
        clubName: editClubName.trim(),
      };

      const response = await fetch(`/api/events/${selectedEvent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || t('events.admin.updateError'));
      }

      setEvents((prev) => prev.map((item) => (item._id === selectedEvent._id ? data.data : item)));
      toast.success(t('events.admin.updateSuccess'));
      resetEditState();
    } catch (err: any) {
      toast.error(err?.message || t('events.admin.updateError'));
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t('events.admin.deleteConfirm'));
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || t('events.admin.deleteError'));
      }
      setEvents((prev) => prev.filter((item) => item._id !== id));
      toast.success(t('events.admin.deleteSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('events.admin.deleteError'));
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen bg-[#FFF5F0] px-4 pt-32 pb-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#994D1C]">{t('events.admin.listTitle')}</h1>
            <p className="text-sm text-[#C17B4C]">{t('events.admin.manageDescription')}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/events-admin/add')}
              className="rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] px-4 py-2.5 text-sm font-semibold text-white shadow transition-transform duration-200 hover:scale-[1.02]"
            >
              {t('events.admin.addNewButton')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-[#FFE5D9] px-4 py-2.5 text-sm font-medium text-[#994D1C] shadow hover:bg-[#FFDAC8] transition"
            >
              {t('events.admin.logoutButton')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#FFB996] border-t-[#FF8B5E]" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : formattedEvents.length === 0 ? (
          <div className="rounded-xl border border-[#FFE5D9] bg-white px-4 py-6 text-center text-sm text-[#C17B4C]">
            {t('events.admin.noEvents')}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#FFE5D9] bg-white shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#FFE5D9] text-sm">
                <thead className="bg-[#FFF0E6] text-[#994D1C] uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">{t('events.admin.titleLabel')}</th>
                    <th className="px-4 py-3 text-left">{t('events.admin.tableDate')}</th>
                    <th className="px-4 py-3 text-left">{t('events.admin.tableCategory')}</th>
                    <th className="px-4 py-3 text-left">{t('events.admin.tableLocation')}</th>
                    <th className="px-4 py-3 text-left">{t('events.admin.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFE5D9]">
                  {formattedEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-[#FFF8F4]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#6B3416]">{event.title}</div>
                        <div className="text-xs text-[#C17B4C] line-clamp-2">{event.description}</div>
                      </td>
                      <td className="px-4 py-3 text-[#6B3416]">{event.formattedDate}</td>
                      <td className="px-4 py-3 text-[#6B3416]">{event.category || '-'}</td>
                      <td className="px-4 py-3 text-[#6B3416]">{event.location || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(event)}
                            className="rounded-lg bg-[#FFE5D9] px-3 py-1.5 text-xs font-semibold text-[#994D1C] shadow-sm hover:bg-[#FFDAC8] transition"
                          >
                            {t('events.admin.editButton')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event._id)}
                            disabled={deletingId === event._id}
                            className="rounded-lg bg-[#FF8B5E] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#FF7A47] disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deletingId === event._id ? '...' : t('events.admin.deleteButton')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editing && selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[#FFE5D9] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#994D1C]">{t('events.admin.editTitle')}</h2>
              <button
                type="button"
                onClick={resetEditState}
                className="text-sm font-medium text-[#C17B4C] hover:text-[#994D1C]"
              >
                {t('events.admin.closeButton')}
              </button>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.titleLabel')}</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.dateLabel')}</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.descriptionLabel')}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] min-h-[120px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.categoryLabel')}</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.locationLabel')}</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.photoLabel')}</label>
                <input
                  type="text"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://"
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">{t('events.admin.resourcesLabel')}</label>
                <textarea
                  value={editResources}
                  onChange={(e) => setEditResources(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] min-h-[100px]"
                  placeholder={t('events.admin.resourcesPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6B3416]">Kulüp Adı</label>
                <input
                  type="text"
                  value={editClubName}
                  onChange={(e) => setEditClubName(e.target.value)}
                  className="w-full rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetEditState}
                  className="rounded-lg border border-[#FFE5D9] px-4 py-2.5 text-sm font-medium text-[#994D1C] hover:bg-[#FFF5F0] transition"
                >
                  {t('events.admin.closeButton')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] px-4 py-2.5 text-sm font-semibold text-white shadow transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? t('events.admin.saving') : t('events.admin.saveChangesButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
