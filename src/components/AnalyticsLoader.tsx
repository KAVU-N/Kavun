"use client";
import { useEffect } from "react";

export default function AnalyticsLoader() {
  useEffect(() => {
    // Çerez izni kontrolü
    if (typeof window !== "undefined") {
      const consent = window.localStorage.getItem("kavunla_cookie_consent") ||
        (document.cookie.match('(^|;)\\s*kavunla_cookie_consent\\s*=\\s*([^;]+)')?.pop() || "");

      if (consent === "true") {
        // Google Analytics scriptini ekle (GA kodunu burada değiştir)
        if (!(window as any).gtagScriptLoaded) {
          const script = document.createElement("script");
          script.src = "https://www.googletagmanager.com/gtag/js?id=G-3HVHQ85MZ0"; // <-- GA kodunu buraya yaz
          script.async = true;
          document.head.appendChild(script);

          const script2 = document.createElement("script");
          script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3HVHQ85MZ0');
          `;
          document.head.appendChild(script2);
          (window as any).gtagScriptLoaded = true;

        }
      }
    }
  }, []);

  return null;
}
