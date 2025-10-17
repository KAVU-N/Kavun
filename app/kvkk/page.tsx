"use client";
import React from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function KvkkPage() {
  const { t } = useLanguage();

  const controllerInfo = [
    {
      label: t("kvkkPage.section1.items.company.label"),
      value: t("kvkkPage.section1.items.company.value")
    },
    {
      label: t("kvkkPage.section1.items.address.label"),
      value: t("kvkkPage.section1.items.address.value")
    },
    {
      label: t("kvkkPage.section1.items.email.label"),
      value: t("kvkkPage.section1.items.email.value")
    },
    {
      label: t("kvkkPage.section1.items.phone.label"),
      value: t("kvkkPage.section1.items.phone.value")
    }
  ];

  const personalDataItems = [
    t("kvkkPage.section2.items.fullName"),
    t("kvkkPage.section2.items.email"),
    t("kvkkPage.section2.items.phone"),
    t("kvkkPage.section2.items.ip"),
    t("kvkkPage.section2.items.cardInfo"),
    t("kvkkPage.section2.items.userContent"),
    t("kvkkPage.section2.items.cookies")
  ];

  const processingPurposes = [
    t("kvkkPage.section3.items.membership"),
    t("kvkkPage.section3.items.payments"),
    t("kvkkPage.section3.items.contentManagement"),
    t("kvkkPage.section3.items.serviceImprovement"),
    t("kvkkPage.section3.items.requests"),
    t("kvkkPage.section3.items.legal")
  ];

  const transferTargets = [
    t("kvkkPage.section5.items.authorities"),
    t("kvkkPage.section5.items.serviceProviders"),
    t("kvkkPage.section5.items.foreignProviders")
  ];

  const rights = [
    t("kvkkPage.section8.items.item1"),
    t("kvkkPage.section8.items.item2"),
    t("kvkkPage.section8.items.item3"),
    t("kvkkPage.section8.items.item4"),
    t("kvkkPage.section8.items.item5"),
    t("kvkkPage.section8.items.item6"),
    t("kvkkPage.section8.items.item7"),
    t("kvkkPage.section8.items.item8"),
    t("kvkkPage.section8.items.item9")
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-8 px-2">
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl bg-white/90 border border-[#FFD6BA] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFB996] shadow-lg">
            <svg className="w-7 h-7 text-[#994D1C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-2-2m2 2l2-2" /></svg>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#994D1C] tracking-tight drop-shadow-lg">
            {t('kvkkPage.title')}
          </h1>
        </div>
        <div className="prose prose-lg max-w-none text-[#6B3416]">
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section1.title")}</h2>
            <p>{t("kvkkPage.section1.paragraph1")}</p>
            <ul className="list-disc pl-6">
              {controllerInfo.map((item) => (
                <li key={item.label}>
                  <b>{item.label}:</b> {item.value}
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section2.title")}</h2>
            <p>{t("kvkkPage.section2.paragraph1")}</p>
            <ul className="list-disc pl-6">
              {personalDataItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section3.title")}</h2>
            <p>{t("kvkkPage.section3.paragraph1")}</p>
            <ul className="list-disc pl-6">
              {processingPurposes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{t("kvkkPage.section3.paragraph2")}</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section4.title")}</h2>
            <p>{t("kvkkPage.section4.paragraph1")}</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section5.title")}</h2>
            <p>{t("kvkkPage.section5.paragraph1")}</p>
            <ul className="list-disc pl-6">
              {transferTargets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{t("kvkkPage.section5.paragraph2")}</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section6.title")}</h2>
            <p>{t("kvkkPage.section6.paragraph1")}</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section7.title")}</h2>
            <p>{t("kvkkPage.section7.paragraph1")}</p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section8.title")}</h2>
            <p>{t("kvkkPage.section8.paragraph1")}</p>
            <ul className="list-disc pl-6">
              {rights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              {t("kvkkPage.section8.contactPrefix")}
              <a href="mailto:info@kavunla.com" className="text-[#FF8B5E] underline">info@kavunla.com</a>
              {t("kvkkPage.section8.contactSuffix")}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">{t("kvkkPage.section9.title")}</h2>
            <p>{t("kvkkPage.section9.paragraph1")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
