'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function EventsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;
    const ensureAuth = async () => {
      if (pathname === '/events-admin/login') {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/events/admin-check', { cache: 'no-store' });
        if (!response.ok) {
          if (!ignore) {
            setChecking(false);
            router.replace('/events-admin/login');
          }
          return;
        }
        if (!ignore) {
          setChecking(false);
        }
      } catch (error) {
        if (!ignore) {
          setChecking(false);
          router.replace('/events-admin/login');
        }
      }
    };

    ensureAuth();
    return () => {
      ignore = true;
    };
  }, [pathname, router]);

  if (pathname !== '/events-admin/login' && checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0]">
        <div className="text-[#994D1C] font-medium tracking-wide animate-pulse">
          Kontrol ediliyor...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
