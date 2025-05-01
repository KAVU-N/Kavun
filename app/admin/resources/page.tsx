"use client";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { toast } from "react-hot-toast";

interface Resource {
  _id?: string;
  title: string;
  description: string;
  author: string;
  category: string;
  format: string;
  url?: string;
  createdAt?: string;
  fileData?: string;
  fileName?: string;
}

export default function AdminResourcesPage() {
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/resources");
    if (res.ok) {
      setResources(await res.json());
    } else {
      toast.error("Kaynaklar yüklenemedi");
    }
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editResource?._id ? "PUT" : "POST";
    const url = editResource?._id ? `/api/admin/resources/${editResource._id}` : "/api/admin/resources";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editResource),
    });
    if (res.ok) {
      toast.success(editResource?._id ? "Kaynak güncellendi" : "Kaynak eklendi");
      setModalOpen(false);
      setEditResource(null);
      fetchResources();
    } else {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaynağı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Kaynak silindi");
      fetchResources();
    } else {
      toast.error("Silme başarısız");
    }
  };

  const handleDownload = (resource: Resource) => {
    if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank");
    } else if ((resource as any).fileData) {
      try {
        const link = document.createElement("a");
        link.href = (resource as any).fileData;
        const fileName = (resource as any).fileName || `${resource.title}.${resource.format?.toLowerCase?.() || 'dosya'}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        alert("Dosya indirilemedi.");
      }
    } else {
      alert("Dosya bulunamadı.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">{t("resources") || "Kaynaklar"}</h1>
        <button onClick={() => { setEditResource({ title: "", description: "", author: "", category: "", format: "" }); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">{t("addResource") || "Kaynak Ekle"}</button>
      </div>
      {loading ? <div className="text-center text-gray-500">Yükleniyor...</div> : (
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full border bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">{t("title") || "Başlık"}</th>
                <th className="p-2">{t("author") || "Yazar"}</th>
                <th className="p-2">{t("category") || "Kategori"}</th>
                <th className="p-2">{t("format") || "Format"}</th>
                {/* Dosya sütunu kaldırıldı */}
                <th className="p-2">İndir</th>
                <th className="p-2">{t("actions") || "İşlemler"}</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id} className="border-t hover:bg-blue-50">
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{r.author}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.format}</td>
                  {/* Dosya sütunu kaldırıldı */}
                  <td className="p-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleDownload(r)}>İndir</button>
                  </td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-600 hover:underline" onClick={() => { setEditResource(r); setModalOpen(true); }}>{t("edit") || "Düzenle"}</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(r._id!)}>{t("delete") || "Sil"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-800">{editResource?._id ? t("editResource") || "Kaynağı Düzenle" : t("addResource") || "Kaynak Ekle"}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder={t("title") || "Başlık"} value={editResource?.title || ""} onChange={e => setEditResource(r => ({ ...r!, title: e.target.value }))} required />
              <input className="w-full border p-2 rounded" placeholder={t("author") || "Yazar"} value={editResource?.author || ""} onChange={e => setEditResource(r => ({ ...r!, author: e.target.value }))} required />
              <input className="w-full border p-2 rounded" placeholder={t("category") || "Kategori"} value={editResource?.category || ""} onChange={e => setEditResource(r => ({ ...r!, category: e.target.value }))} required />
              <input className="w-full border p-2 rounded" placeholder={t("format") || "Format"} value={editResource?.format || ""} onChange={e => setEditResource(r => ({ ...r!, format: e.target.value }))} required />
              <textarea className="w-full border p-2 rounded" placeholder={t("description") || "Açıklama"} value={editResource?.description || ""} onChange={e => setEditResource(r => ({ ...r!, description: e.target.value }))} required />
              <input className="w-full border p-2 rounded" placeholder={t("url") || "Bağlantı (opsiyonel)"} value={editResource?.url || ""} onChange={e => setEditResource(r => ({ ...r!, url: e.target.value }))} />
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setModalOpen(false); setEditResource(null); }}>{t("cancel") || "İptal"}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t("save") || "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
