'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface EventClub {
  _id?: string;
  name?: string;
  university?: string;
  category?: string;
  logoUrl?: string;
}

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  location?: string;
  photoUrl?: string;
  resources?: string[];
  clubs?: EventClub[];
  universities?: string[];
  clubName?: string;
}

export default function EventDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string | undefined;

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError(t('events.detail.notFound'));
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/events/${eventId}`, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || t('events.detail.error'));
        }

        if (!ignore) {
          setEventData(data?.data ?? null);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || t('events.detail.error'));
          setEventData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchEvent();
    return () => {
      ignore = true;
    };
  }, [eventId, t]);

  const formattedDate = useMemo(() => {
    if (!eventData?.date) return '';
    const value = new Date(eventData.date);
    if (Number.isNaN(value.getTime())) return '';
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(value);
  }, [eventData?.date, language]);

  const hasResources = !!eventData?.resources && eventData.resources.length > 0;
  const hasClubs = !!eventData?.clubs && eventData.clubs.length > 0;
  const hasUniversities = !!eventData?.universities && eventData.universities.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] px-4 pt-32 pb-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#994D1C]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FFB996]/40 border-t-[#FF8B5E]" />
            <span className="text-sm font-medium">{t('events.detail.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] px-4 pt-32 pb-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-[#FFE5D9] p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-[#994D1C]">{t('events.detail.notFound')}</h1>
          <p className="text-[#6B3416] text-sm">{error || t('events.detail.error')}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-[#FFE5D9] text-[#994D1C] font-medium hover:bg-[#FFF5F0] transition"
            >
              {t('general.goBack')}
            </button>
            <Link
              href="/etkinlikler"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold shadow hover:shadow-md transition"
            >
              {t('events.detail.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] px-4 pt-32 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/etkinlikler"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#FFE5D9] text-[#994D1C] bg-white shadow-sm hover:bg-[#FFF5F0] transition"
          >
            <span aria-hidden="true">←</span>
            <span className="text-sm font-semibold">{t('events.detail.back')}</span>
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#FFE5D9] text-[#994D1C] bg-white shadow-sm hover:bg-[#FFF5F0] transition"
          >
            {t('general.goBack')}
          </button>
        </div>

        <article className="bg-white rounded-3xl border border-[#FFE5D9] shadow-xl overflow-hidden">
          {eventData.photoUrl ? (
            <div className="relative h-72 w-full">
              <Image
                src={eventData.photoUrl}
                alt={eventData.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="p-8 space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-block rounded-full bg-[#FFE5D9] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FF8B5E]">
                    {eventData.category || t('category.other')}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#994D1C] leading-tight">
                    {eventData.title}
                  </h1>
                </div>

                {formattedDate && (
                  <div className="rounded-2xl border border-[#FFE5D9] bg-[#FFF5F0] px-4 py-3 text-sm text-[#6B3416]">
                    <div className="font-semibold text-[#994D1C]">{t('events.eventDate')}</div>
                    <div>{formattedDate}</div>
                  </div>
                )}
              </div>

              {eventData.location && (
                <div className="flex items-center gap-2 text-sm text-[#6B3416]">
                  <span className="font-semibold">{t('events.locationLabel')}:</span>
                  <span>{eventData.location}</span>
                </div>
              )}

              {eventData.clubName && (
                <div className="flex items-center gap-2 text-sm text-[#6B3416]">
                  <span className="font-semibold">{t('events.detail.organizedBy')}:</span>
                  <span>{eventData.clubName}</span>
                </div>
              )}

              {hasUniversities && (
                <div className="text-sm text-[#6B3416] space-y-2">
                  <div className="font-semibold">{t('events.detail.universities')}</div>
                  <ul className="list-disc list-inside space-y-1">
                    {eventData.universities!.map((uni, index) => (
                      <li key={index}>{uni}</li>
                    ))}
                  </ul>
                </div>
              )}
            </header>

            <section className="space-y-3 text-[#6B3416]">
              <h2 className="text-xl font-semibold text-[#994D1C]">{t('general.description')}</h2>
              <p className="leading-relaxed whitespace-pre-line">{eventData.description}</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#994D1C]">{t('events.detail.clubsTitle')}</h2>
              {hasClubs ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {eventData.clubs!.map((club) => (
                    <div
                      key={club._id ?? club.name}
                      className="flex items-center gap-4 rounded-2xl border border-[#FFE5D9] bg-[#FFF5F0] p-4"
                    >
                      {club.logoUrl ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#FFE5D9] bg-white">
                          <Image
                            src={club.logoUrl}
                            alt={club.name || 'Club'}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE5D9] text-[#994D1C] font-semibold">
                          {(club.name ?? '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 text-sm text-[#6B3416]">
                        <div className="font-semibold text-[#994D1C]">{club.name || '—'}</div>
                        {club.university ? <div>{club.university}</div> : null}
                        {club.category ? (
                          <div className="text-xs text-[#C17B4C] uppercase tracking-wide">{club.category}</div>
                        ) : null}
                        {club._id ? (
                          <Link
                            href={`/kulupler/${club._id}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#994D1C] underline hover:text-[#FF8B5E]"
                          >
                            {t('clubs.viewDetails')}
                            <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B3416]">{t('events.detail.clubsEmpty')}</p>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#994D1C]">{t('events.detail.resourcesTitle')}</h2>
              {hasResources ? (
                <ul className="space-y-2 text-sm">
                  {eventData.resources!.map((resource, index) => (
                    <li key={`${resource}-${index}`}>
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
              ) : (
                <p className="text-sm text-[#6B3416]">{t('events.detail.resourcesEmpty')}</p>
              )}
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
