'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';

export default function ComingSoonPage() {
  useEffect(() => {
    notFound();
  }, []);

  return null;
}
