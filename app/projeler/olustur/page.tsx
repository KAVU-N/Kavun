"use client";

import React, { useState } from "react";
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
      if (!isValidLinkedInUrl(form.linkedinUrl)) {
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
    <div className="max-w-xl mx-auto px-4 pt-28 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-[#994D1C]">{t("nav.projects")} - Yeni Proje</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} placeholder="Proje Adı" className="w-full border p-2 rounded" />
        <textarea required name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="w-full border p-2 h-32 rounded" />
        <input required name="linkedinUrl" value={form.linkedinUrl || ""} onChange={handleChange} placeholder="LinkedIn URL" className="w-full border p-2 rounded" />
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
          <option value="Yapay Zeka">Yapay Zeka</option>
        </select>
        <button disabled={loading} type="submit" className="bg-[#994D1C] text-white px-4 py-2 rounded hover:bg-[#7e3f17] transition">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
