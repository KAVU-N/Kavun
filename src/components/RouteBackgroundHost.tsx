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
    pathname?.startsWith("/ilan") ||
    pathname?.startsWith("/ilanlar") ||
    pathname?.startsWith("/projeler") ||
    pathname?.startsWith("/kaynaklar") ||
    pathname?.startsWith("/kulupler")
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
