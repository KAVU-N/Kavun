"use client";
import { usePathname } from "next/navigation";
import React from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  hideOnAdmin?: boolean;
}

export default function ClientOnly({ children, hideOnAdmin = false }: ClientOnlyProps) {
  const pathname = usePathname();
  if (hideOnAdmin && pathname?.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}
