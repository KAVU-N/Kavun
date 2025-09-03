import Link from 'next/link';
import { headers } from 'next/headers';
import ClubContactActions from '@/src/components/ClubContactActions';
import Image from 'next/image';

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

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const payload = await getClub(id);
  const club = payload?.data;
  const owner = payload?.owner as { _id?: string; name?: string; email?: string } | undefined;

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link href="/kulupler" className="text-[#994D1C] hover:underline">← Kulüplere dön</Link>
        <div className="mt-4 rounded-2xl bg-white/70 border border-black/10 p-6 shadow">
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
                <h1 className="text-2xl font-bold text-[#994D1C]">{club.name}</h1>
                <div className="text-black/70">{club.university}{club.category ? ` • ${club.category}` : ''}</div>
              </div>

              {club.description && (
                <div>
                  <h2 className="font-semibold mb-1">Hakkında</h2>
                  <p className="text-black/80 whitespace-pre-wrap">{club.description}</p>
                </div>
              )}

              {(owner?.name || owner?.email) && (
                <div>
                  <h2 className="font-semibold mb-1">İletişim</h2>
                  <div className="text-black/80">
                    {owner?.name && <div>Ekleyen: {owner.name}</div>}
                    {owner?.email && (
                      <div>E-posta: <a className="text-[#994D1C] underline" href={`mailto:${owner.email}`}>{owner.email}</a></div>
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
    </div>
  );
}
