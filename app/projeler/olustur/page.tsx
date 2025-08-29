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
        alert('LinkedIn URL geçersiz');
        setLoading(false);
        return;
      }
      if (check.some((f) => containsProhibited(f))) {
        alert('Uygunsuz içerik tespit edildi. Lütfen metni düzenleyin.');
        setLoading(false);
        return;
      }
      const payload = {
        ...form,
        ownerId: user?._id || user?.id || undefined,
      };
      if (!payload.ownerId) { alert("Oturum bulunamadı"); setLoading(false); return; }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Proje oluşturulamadı");
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
            <span className="font-medium">Geri Dön</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6 text-[#994D1C] text-center">Yeni Proje Oluştur</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} placeholder="Proje Adı" className="w-full border p-2 rounded" />
        <textarea required name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="w-full border p-2 h-32 rounded" />
        <input name="linkedinUrl" value={form.linkedinUrl || ""} onChange={handleChange} placeholder="LinkedIn URL (opsiyonel)" className="w-full border p-2 rounded" />
        <input required name="contact" value={form.contact} onChange={handleChange} placeholder="İletişim (e-posta, Discord vs.)" className="w-full border p-2 rounded" />

        {/* Başvuran Gereksinimleri */}
        <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="Başvuranın Gereksinimleri" className="w-full border p-2 h-24 rounded" />
        <input name="position" value={form.position} onChange={handleChange} placeholder="Aradığımız Kişi / Pozisyon" className="w-full border p-2 rounded" />
        {/* Sağlanan Fırsatlar */}
        <textarea name="benefits" value={form.benefits} onChange={handleChange} placeholder="Başvurana Sağlayacaklarımız" className="w-full border p-2 h-24 rounded" />
        <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="Genel">Genel</option>
          <option value="Web">Web</option>
          <option value="Mobil">Mobil</option>
          <option value="Masaüstü">Masaüstü</option>
          <option value="Yapay Zeka">Yapay Zeka</option>
          <option value="Oyun">Oyun</option>
          <option value="Veri Bilimi">Veri Bilimi</option>
          <option value="Siber Güvenlik">Siber Güvenlik</option>
          <option value="Blockchain">Blockchain</option>
          <option value="IoT">IoT</option>
          <option value="AR/VR">AR/VR</option>
          <option value="Robotik">Robotik</option>
          <option value="E-Ticaret">E-Ticaret</option>
          <option value="FinTech">FinTech</option>
          <option value="Sağlık">Sağlık</option>
          <option value="Eğitim">Eğitim</option>
          <option value="Cloud">Cloud</option>
          <option value="DevOps">DevOps</option>
          <option value="Data Engineering">Data Engineering</option>
          <option value="Donanım">Donanım</option>
          <option value="Diğer">Diğer</option>
        </select>
        <button disabled={loading} type="submit" className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white px-6 py-3 text-base md:text-lg rounded-lg hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300 block mx-auto">
          {loading ? "Kaydediliyor..." : "Oluştur"}
        </button>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}
