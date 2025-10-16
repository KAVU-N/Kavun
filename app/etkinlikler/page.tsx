'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { citiesTR } from '@/src/data/cities';

type TextLike =
  | string
  | { name?: string; title?: string; value?: string; label?: string }
  | null
  | undefined;

function normalizeText(input: TextLike): string | null {
  if (!input) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof input === 'object') {
    const candidate = input.name ?? input.title ?? input.value ?? input.label;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

function normalizeToArray(input: TextLike | TextLike[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((item) => normalizeText(item))
      .filter((value): value is string => Boolean(value));
  }
  const single = normalizeText(input);
  return single ? [single] : [];
}

interface EventClub {
  _id?: string;
  name?: string;
  university?: TextLike;
  category?: TextLike;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  category?: TextLike | TextLike[];
  location?: string;
  photoUrl?: string;
  resources?: string[];
  clubs?: EventClub[];
  clubName?: TextLike;
}

interface DisplayClub {
  _id?: string;
  name?: string;
  linkName: string;
  university?: string | null;
  category?: string | null;
}

interface DisplayEvent extends EventItem {
  formattedDate: string;
  categoryLabel: string | null;
  displayClubs: DisplayClub[];
  displayClubName?: string | null;
}

export default function EventsPage() {
  const { t, language } = useLanguage();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchEvents = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set('q', searchTerm.trim());
        if (selectedLocation) params.set('location', selectedLocation);
        if (selectedCategory) params.set('category', selectedCategory);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        const query = params.toString();
        const response = await fetch(`/api/events${query ? `?${query}` : ''}`, {
          signal,
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load events');
        }
        setEvents(Array.isArray(data?.data) ? data.data : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Failed to load events');
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedLocation, selectedCategory, startDate, endDate]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
  };

  const categories = useMemo(
    () => ['Konser', 'Eğitim', 'Konferans', 'Uzaktan', 'Buluşma'],
    []
  );

  const formattedEvents = useMemo<DisplayEvent[]>(() => {
    return events.map((event) => {
      const dateValue = new Date(event.date);
      let formattedDate = event.date;
      if (!Number.isNaN(dateValue.getTime())) {
        formattedDate = new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }).format(dateValue);
      }
      const categoryLabel = normalizeToArray(event.category)[0] ?? null;
      const displayClubs: DisplayClub[] = (event.clubs ?? []).map((club) => {
        const linkName = normalizeText(club.name) ?? (typeof club.name === 'string' ? club.name : '') ?? '';
        const university = normalizeText(club.university);
        const category = normalizeText(club.category);
        return {
          ...club,
          linkName: linkName.length > 0 ? linkName : (club._id ? '—' : ''),
          university,
          category,
        };
      });
      const displayClubName = normalizeText(event.clubName);
      return { ...event, formattedDate, categoryLabel, displayClubs, displayClubName };
    });
  }, [events, language]);

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl border border-[#FFE5D9] px-10 py-12 space-y-10">
          <header className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#994D1C]">{t('events.title')}</h1>
          </header>

          <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('events.searchPlaceholder')}
                className="flex-1 rounded-xl border border-[#FFE5D9] bg-[#FFF9F6] px-4 py-2.5 text-sm text-[#6B3416] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] px-6 py-2.5 text-sm font-semibold text-white shadow transition-transform duration-200 hover:scale-[1.01]"
              >
                {t('events.searchButton')}
              </button>
            </form>

            <div className="rounded-2xl border border-[#FFE5D9] bg-[#FFF9F6] px-4 py-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left text-[#994D1C] font-semibold text-sm tracking-wide"
              >
                <span>{t('events.filtersTitle')}</span>
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {filtersOpen && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6B3416]/80 uppercase tracking-wide">
                      {t('events.filterLocation')}
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(event) => setSelectedLocation(event.target.value)}
                      className="rounded-xl border border-[#FFE5D9] bg-white px-4 py-2.5 text-sm text-[#6B3416] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                    >
                      <option value="">{t('events.allLocations') ?? 'Tüm Konumlar'}</option>
                      {citiesTR.map((city: string) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6B3416]/80 uppercase tracking-wide">
                      {t('events.filterCategory')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className="rounded-xl border border-[#FFE5D9] bg-white px-4 py-2.5 text-sm text-[#6B3416] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                    >
                      <option value="">{t('events.allCategories')}</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6B3416]/80 uppercase tracking-wide">
                      {t('events.filterDateFrom')}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="rounded-xl border border-[#FFE5D9] bg-white px-4 py-2.5 text-sm text-[#6B3416] focus:outline-none focus:ring-2 focus_RING-[#FF8B5E]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#6B3416]/80 uppercase tracking-wide">
                      {t('events.filterDateTo')}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="rounded-xl border border-[#FFE5D9] bg-white px-4 py-2.5 text-sm text-[#6B3416] focus:outline-none focus:ring-2 focus_RING-[#FF8B5E]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="w-full rounded-xl border border-[#FFE5D9] bg-white px-4 py-2.5 text-sm font-semibold text-[#994D1C] shadow-sm transition hover:bg-[#FFF5F0]"
                    >
                      {t('events.resetFilters')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#FFB996] border-t-[#FF8B5E]" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
                {error}
              </div>
            ) : formattedEvents.length === 0 ? (
              <div className="rounded-xl border border-[#FFE5D9] bg-[#FFF5F0] px-4 py-6 text-center text-sm text-[#C17B4C]">
                {t('events.noResults')}
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {formattedEvents.map((event) => (
                  <article
                    key={event._id}
                    className="overflow-hidden rounded-3xl border border-[#FFE5D9] bg-white shadow hover:shadow-md transition-shadow flex flex-col"
                  >
                    {event.photoUrl ? (
                      <div className="relative h-40 w-full">
                        <Image src={event.photoUrl} alt={event.title} fill className="object-cover" />
                      </div>
                    ) : null}
                    <div className="space-y-3 p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[#994D1C]">{event.title}</h2>
                        {event.categoryLabel && (
                          <span className="text-xs font-medium uppercase tracking-wide text-[#FF8B5E] bg-[#FFE5D9] rounded-full px-2 py-1">
                            {event.categoryLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-[#C17B4C] uppercase tracking-wide">
                        {t('events.eventDate')}: {event.formattedDate}
                      </div>
                      {event.location && (
                        <div className="text-xs text-[#6B3416]">
                          <span className="font-semibold">{t('events.locationLabel')}:</span> {event.location}
                        </div>
                      )}
                      <p className="text-sm text-[#6B3416]/90 line-clamp-3">
                        {event.description}
                      </p>

                      {Array.isArray(event.resources) && event.resources.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#994D1C]">
                            {t('events.resourcesLabel')}
                          </div>
                          <ul className="space-y-1 text-xs">
                            {event.resources.map((resource, index) => (
                              <li key={index}>
                                <a
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#FF8B5E] underline break-words"
                                >
                                  {resource}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-auto space-y-4">
                        {(event.displayClubs.length > 0 || event.displayClubName) && (
                          <div className="space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-wide text-[#994D1C]">
                              {t('events.associatedClubs')}
                            </div>
                            {event.displayClubs.length > 0 ? (
                              <ul className="space-y-1 text-xs">
                                {event.displayClubs.map((club) => (
                                  <li key={club._id ?? `${event._id}-${club.name}`}>
                                    {club._id ? (
                                      <Link
                                        href={`/kulupler/${club._id}`}
                                        className="text-[#994D1C] underline hover:text-[#FF8B5E]"
                                      >
                                        {club.linkName}
                                      </Link>
                                    ) : (
                                      <span>{club.linkName}</span>
                                    )}
                                    {club.university ? (
                                      <span className="text-[10px] text-[#C17B4C] block">{club.university}</span>
                                    ) : null}
                                    {club.category ? (
                                      <span className="text-[10px] text-[#C17B4C] block">{club.category}</span>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {event.displayClubName && event.displayClubs.length === 0 ? (
                              <div className="text-xs text-[#6B3416]">{event.displayClubName}</div>
                            ) : null}
                          </div>
                        )}
                        <Link
                          href={`/etkinlikler/${event._id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#994D1C] hover:text-[#FF8B5E]"
                        >
                          {t('home.featuredEvents.view')}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
