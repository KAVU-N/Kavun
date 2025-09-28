'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';

const ChatBox = dynamic(() => import('@/src/components/ChatBox'), { ssr: false });

interface ClubContactActionsProps {
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  university?: string;
}

export default function ClubContactActions({ ownerId, ownerName, ownerEmail, university }: ClubContactActionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instructor, setInstructor] = useState<{
    _id: string;
    name?: string;
    email?: string;
    university?: string;
    role?: string;
  } | null>(null);
  const { t } = useLanguage();

  const normalizeInstructor = (data: any) => ({
    _id: data?._id || data?.id || ownerId,
    name: data?.name || ownerName || 'Kulüp Sahibi',
    email: data?.email || ownerEmail || '',
    university: data?.university || university || '',
    role: data?.role || 'user',
  });

  const fetchInstructor = async () => {
    if (instructor) return instructor;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/public/${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        const normalized = normalizeInstructor(data);
        setInstructor(normalized);
        return normalized;
      }
    } catch (err) {
      console.error('Kulüp sahibi bilgisi alınamadı:', err);
    } finally {
      setLoading(false);
    }
    const fallback = normalizeInstructor(null);
    setInstructor(fallback);
    return fallback;
  };

  const handleMessageClick = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    const targetInstructor = await fetchInstructor();
    if (targetInstructor?._id) {
      setOpen(true);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleMessageClick}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white hover:opacity-90 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {t('clubs.contactButton')}
      </button>

      {open && instructor && (
        <ChatBox
          instructor={instructor as any}
          onClose={() => setOpen(false)}
        />
      )}
      {loading && (
        <div className="mt-2 text-sm text-white/80">
          {t('general.loading')}
        </div>
      )}
    </div>
  );
}
