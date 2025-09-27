"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function CreateProjectPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = require('src/context/AuthContext').useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    linkedinUrl: "",
    category: "Genel",
    contact: user?.email || "",
    requirements: "",
    benefits: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { containsProhibited, isValidLinkedInUrl } = require('@/lib/contentFilter');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basit içerik kontrolü (istemci tarafı)
      const check = [form.title, form.description, form.requirements, form.benefits];
      if (form.linkedinUrl && !isValidLinkedInUrl(form.linkedinUrl)) {
        alert(t('errors.invalidLinkedInUrl'));
        setLoading(false);
        return;
      }
      if (check.some((f) => containsProhibited(f))) {
        alert(t('errors.prohibitedContentDetected'));
        setLoading(false);
        return;
      }
      const payload = {
        ...form,
        ownerId: user?._id || user?.id || undefined,
      };
      if (!payload.ownerId) { alert(t('errors.sessionNotFound')); setLoading(false); return; }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t('errors.projectCreationFailed'));
      router.push("/projeler");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-xl mx-auto px-4 relative z-10">
        <div className="relative">
          <Link
            href="/projeler"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#994D1C]/30 text-[#994D1C] bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-[#6B3416]/40 transition-all duration-300 absolute top-0 -left-3 -translate-x-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">{t('general.goBack')}</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6 text-[#994D1C] text-center">{t('project.createNewTitle')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} placeholder={t('project.title')} className="w-full border p-2 rounded" />
        <textarea required name="description" value={form.description} onChange={handleChange} placeholder={t('project.description')} className="w-full border p-2 h-32 rounded" />
        <input name="linkedinUrl" value={form.linkedinUrl || ""} onChange={handleChange} placeholder={t('project.linkedinUrlOptional')} className="w-full border p-2 rounded" />
        <input required name="contact" value={form.contact} onChange={handleChange} placeholder={t('project.contactPlaceholder')} className="w-full border p-2 rounded" />

        {/* Başvuran Gereksinimleri */}
        <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder={t('project.applicantRequirements')} className="w-full border p-2 h-24 rounded" />
        <input name="position" value={form.position} onChange={handleChange} placeholder={t('project.position')} className="w-full border p-2 rounded" />
        {/* Sağlanan Fırsatlar */}
        <textarea name="benefits" value={form.benefits} onChange={handleChange} placeholder={t('project.benefitsPlaceholder')} className="w-full border p-2 h-24 rounded" />
        <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="Genel">{t('category.general')}</option>
          <option value="Web">{t('category.web')}</option>
          <option value="Mobil">{t('category.mobile')}</option>
          <option value="Masaüstü">{t('category.desktop')}</option>
          <option value="Yapay Zeka">{t('category.ai')}</option>
          <option value="Oyun">{t('category.game')}</option>
          <option value="Veri Bilimi">{t('category.dataScience')}</option>
          <option value="Siber Güvenlik">{t('category.cyberSecurity')}</option>
          <option value="Blockchain">{t('category.blockchain')}</option>
          <option value="IoT">{t('category.iot')}</option>
          <option value="AR/VR">{t('category.arvr')}</option>
          <option value="Robotik">{t('category.robotics')}</option>
          <option value="E-Ticaret">{t('category.ecommerce')}</option>
          <option value="FinTech">{t('category.fintech')}</option>
          <option value="Sağlık">{t('category.health')}</option>
          <option value="Eğitim">{t('category.education')}</option>
          <option value="Cloud">{t('category.cloud')}</option>
          <option value="DevOps">{t('category.devops')}</option>
          <option value="Data Engineering">{t('category.dataEngineering')}</option>
          <option value="Donanım">{t('category.hardware')}</option>
          <option value="Diğer">{t('category.other')}</option>
        </select>
        <button disabled={loading} type="submit" className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white px-6 py-3 text-base md:text-lg rounded-lg hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300 block mx-auto">
          {loading ? t('project.creating') : t('project.create')}
        </button>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}
