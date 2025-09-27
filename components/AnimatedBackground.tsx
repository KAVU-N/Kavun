"use client";

import Image from "next/image";
import React from "react";

type AnimatedBackgroundProps = {
  src: string;
  alt?: string;
  objectPosition?: string;
  brightness?: number; // 0..1
  className?: string;
  priority?: boolean;
};

export default function AnimatedBackground({
  src,
  alt = "Arka plan",
  objectPosition = "center 40%",
  brightness = 0.55,
  className = "",
  priority = false,
}: AnimatedBackgroundProps) {
  return (
    <div className={`absolute inset-0 w-full h-full z-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover animated-bg animate-slow-pan origin-center motion-reduce:animate-none"
        style={{
          objectPosition,
          filter: `brightness(${brightness})`,
          willChange: "transform",
          transformOrigin: "center",
          animation: "slowpan 20s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-[#994D1C]/20 mix-blend-multiply" />
    </div>
  );
}
