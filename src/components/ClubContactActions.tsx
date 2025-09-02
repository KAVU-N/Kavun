'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';

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

  const instructor = useMemo(() => ({
    _id: ownerId,
    name: ownerName || 'Kulüp Sahibi',
    email: ownerEmail || '',
    university: university || '',
    role: 'user',
    avatarUrl: undefined,
    price: undefined,
  }), [ownerEmail, ownerId, ownerName, university]);

  const handleMessageClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setOpen(true);
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
        Mesaj Gönder
      </button>

      {open && (
        <ChatBox
          instructor={instructor as any}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
