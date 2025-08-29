"use client";

import { usePathname } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RouteBackgroundHost() {
  const pathname = usePathname();
  const enabled = pathname?.startsWith("/ilanlar") || pathname?.startsWith("/projeler") || pathname?.startsWith("/kaynaklar");

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <AnimatedBackground
        src="/images/homepage-students.jpg"
        alt="Arka plan"
        priority
        objectPosition="center 34.2%"
      />
    </div>
  );
}
