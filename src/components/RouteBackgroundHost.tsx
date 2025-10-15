"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const AnimatedBackground = dynamic(() => import("@/components/AnimatedBackground"), {
  ssr: false,
  // loading: () => null,
});

export default function RouteBackgroundHost() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const enabled = (
    pathname?.startsWith("/etud") ||
    pathname?.startsWith("/auth/login") ||
    pathname?.startsWith("/auth/register") ||
    pathname?.startsWith("/ilan") ||
    pathname?.startsWith("/ilanlar") ||
    pathname?.startsWith("/ilanlarim") ||
    pathname?.startsWith("/projeler") ||
    pathname?.startsWith("/kaynaklar") ||
    pathname?.startsWith("/not-cikar") ||
    pathname?.startsWith("/soru-hazirlat") ||
    pathname?.startsWith("/etkinlikler") ||
    pathname?.startsWith("/kulupler") ||
    pathname?.startsWith("/egitmenler") ||
    pathname?.startsWith("/profil") ||
    pathname?.startsWith("/profilim") ||
    pathname?.startsWith("/bildirimler") ||
    pathname?.startsWith("/mesajlar") ||
    pathname?.startsWith("/mesajlarim") ||
    pathname?.startsWith("/yakinda") ||
    pathname?.startsWith("/ilan-ver") ||
    pathname?.startsWith("/iletisim") ||
    pathname?.startsWith("/sss") ||
    pathname?.startsWith("/kullanim-kosullari") ||
    pathname?.startsWith("/gizlilik-politikasi") ||
    pathname?.startsWith("/cerez-politikasi") ||
    pathname?.startsWith("/kvkk")
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <AnimatedBackground
        src="/images/homepage-students.jpg"
        alt="Arka plan"
        objectPosition="center 34.2%"
      />
    </div>
  );
}
