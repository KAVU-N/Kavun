"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";

interface Project {
  title: string;
  description: string;
  linkedinUrl: string;
  contact: string;
  requirements: string;
  benefits: string;
  position: string;
  category: string;
  status?: string;
}

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [form, setForm] = useState<Project>({
    title: "",
    description: "",
    linkedinUrl: "",
    contact: user?.email || "",
    requirements: "",
    benefits: "",
    category: "Genel",
    position: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Proje getirilemedi");
        const data = await res.json();
        setForm({
          title: data.title,
          description: data.description,
          linkedinUrl: data.linkedinUrl || "",
          contact: data.contact || "",
          requirements: data.requirements || "",
          benefits: data.benefits || "",
           position: data.position || "",
          category: data.category || "Genel",
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { containsProhibited } = require('@/lib/contentFilter');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    // İçerik kontrolü
    const toCheck = [form.title, form.description, form.requirements, form.benefits];
    if (toCheck.some((f) => containsProhibited(f))) {
      alert('Uygunsuz içerik tespit edildi. Lütfen metni düzenleyin.');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?._id }),
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      router.push("/projelerim");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-28 text-center">Yükleniyor...</div>;
  if (error) return <div className="pt-28 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto px-4 pt-28 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-[#994D1C]">{t("nav.projects")} - Düzenle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} placeholder="Proje Adı" className="w-full border p-2 rounded" />
        <textarea required name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="w-full border p-2 h-32 rounded" />
        <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="LinkedIn URL (opsiyonel)" className="w-full border p-2 rounded" />
        <input required name="contact" value={form.contact} onChange={handleChange} placeholder="İletişim (e-posta, Discord vs.)" className="w-full border p-2 rounded" />
        <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="Başvuranın Gereksinimleri" className="w-full border p-2 h-24 rounded" />
        <textarea name="benefits" value={form.benefits} onChange={handleChange} placeholder="Başvurana Sağlayacaklarımız" className="w-full border p-2 h-24 rounded" />
         <input name="position" value={form.position} onChange={handleChange} placeholder="Aradığımız Kişi / Pozisyon" className="w-full border p-2 rounded" />
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
        <button disabled={saving} type="submit" className="bg-[#994D1C] text-white px-4 py-2 rounded hover:bg-[#7e3f17] transition">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
