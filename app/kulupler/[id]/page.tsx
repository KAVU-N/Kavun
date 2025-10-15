import Link from 'next/link';
import { headers } from 'next/headers';
import ClubContactActions from '@/src/components/ClubContactActions';
import Image from 'next/image';
import TranslatedHeading from '@/src/components/TranslatedHeading';

type ClubEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  location?: string;
  photoUrl?: string;
  resources?: string[];
};

async function getClub(id: string) {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const res = await fetch(`${origin}/api/kulupler/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data || null; // { data: club, owner }
}

async function getClubEvents(id: string): Promise<ClubEvent[]> {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const origin = `${proto}://${host}`;
  const res = await fetch(`${origin}/api/events?club=${id}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : [];
}

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const payload = await getClub(id);
  const club = payload?.data;
  const owner = payload?.owner as { _id?: string; name?: string; email?: string } | undefined;
  const events = club ? await getClubEvents(id) : [];

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative">
          <Link
            href="/kulupler"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#994D1C]/30 text-[#994D1C] bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-[#6B3416]/40 transition-all duration-300 absolute top-0 -left-3 -translate-x-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Kulüplere dön</span>
          </Link>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                {!club ? (
                  <div className="text-black/70">Kulüp bulunamadı.</div>
                ) : (
                  <div className="space-y-4">
                    {club.logoUrl && (
                      <div className="w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden bg-gray-100">
                        <Image src={club.logoUrl} alt={`${club.name} logo`} width={1200} height={600} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#994D1C]">{club.name}</h1>
                      </div>
                      <div className="text-black/70">{club.university}{club.category ? ` • ${club.category}` : ''}</div>
                    </div>

                    {club.description && (
                      <div>
                        <TranslatedHeading
                          i18nKey="clubs.about"
                          fallback="Hakkında"
                          className="font-semibold mb-1"
                        />
                        <p className="text-black/80 whitespace-pre-wrap">{club.description}</p>
                      </div>
                    )}

                    {(owner?.name || owner?.email) && (
                      <div>
                        <TranslatedHeading
                          i18nKey="clubs.contact"
                          fallback="İletişim"
                          className="font-semibold mb-1"
                        />
                        <div className="text-black/80 space-y-1">
                          {owner?.name && <div>Ekleyen: {owner.name}</div>}
                          {owner?.email && (
                            <div>
                              E-posta:{' '}
                              <a className="text-[#994D1C] underline" href={`mailto:${owner.email}`}>
                                {owner.email}
                              </a>
                            </div>
                          )}
                        </div>
                        {owner?._id && (
                          <ClubContactActions
                            ownerId={owner._id}
                            ownerName={owner.name}
                            ownerEmail={owner.email}
                            university={club.university}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 space-y-4">
                <TranslatedHeading
                  i18nKey="clubs.events"
                  fallback="Etkinlikler"
                  className="text-lg font-semibold text-[#994D1C]"
                />
                {events.length === 0 ? (
                  <div className="text-sm text-[#C17B4C] bg-[#FFF5F0] border border-[#FFE5D9] rounded-lg px-4 py-3">
                    <TranslatedHeading
                      as="p"
                      i18nKey="clubs.eventsEmpty"
                      fallback="Bu kulüp için etkinlik bulunmuyor."
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => {
                      const eventDate = new Date(event.date);
                      const formattedDate = Number.isNaN(eventDate.getTime())
                        ? event.date
                        : eventDate.toLocaleString('tr-TR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          });
                      return (
                        <div key={event._id} className="rounded-xl border border-[#FFE5D9] bg-[#FFF9F6] p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold text-[#994D1C]">{event.title}</h3>
                            {event.category && (
                              <span className="text-xs font-medium uppercase tracking-wide text-[#FF8B5E] bg-[#FFE5D9] rounded-full px-2 py-1">
                                {event.category}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#C17B4C]">{formattedDate}</div>
                          {event.location && (
                            <div className="text-sm text-[#6B3416]">
                              <span className="font-medium">Konum:</span> {event.location}
                            </div>
                          )}
                          <p className="text-sm text-[#6B3416] whitespace-pre-wrap">{event.description}</p>
                          {Array.isArray(event.resources) && event.resources.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-[#994D1C]">Kaynaklar</div>
                              <ul className="space-y-1">
                                {event.resources.map((item, index) => (
                                  <li key={index}>
                                    <a
                                      href={item}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-[#FF8B5E] underline break-words"
                                    >
                                      {item}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
