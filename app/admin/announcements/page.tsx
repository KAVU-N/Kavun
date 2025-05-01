"use client";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { toast } from "react-hot-toast";

interface Announcement {
  _id?: string;
  title: string;
  content: string;
  date?: string;
  target: 'all' | 'student' | 'teacher';
}

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [target, setTarget] = useState<'all' | 'student' | 'teacher'>('all');

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/announcements");
    if (res.ok) {
      setAnnouncements(await res.json());
    } else {
      toast.error("İlanlar yüklenemedi");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editAnnouncement?._id ? "PUT" : "POST";
    const url = editAnnouncement?._id ? `/api/admin/announcements/${editAnnouncement._id}` : "/api/admin/announcements";
    // target değerini her zaman select'ten al
    const payload = {
      title: editAnnouncement?.title || '',
      content: editAnnouncement?.content || '',
      target // sadece select'ten gelen target kullanılacak
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(editAnnouncement?._id ? "Duyuru güncellendi" : "Duyuru eklendi");
      setModalOpen(false);
      setEditAnnouncement(null);
      fetchAnnouncements();
    } else {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("İlan silindi");
      fetchAnnouncements();
    } else {
      toast.error("Silme başarısız");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">{t("announcements") || "İlanlar"}</h1>
        <button onClick={() => { setEditAnnouncement({ title: "", content: "", target: 'all' }); setTarget('all'); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">{t("addAnnouncement") || "İlan Ekle"}</button>
      </div>
      {loading ? <div className="text-center text-gray-500">Yükleniyor...</div> : (
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full border bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">{t("title") || "Başlık"}</th>
                <th className="p-2">{t("content") || "İçerik"}</th>
                <th className="p-2">{t("date") || "Tarih"}</th>
                <th className="p-2">{t("target") || "Hedef Kitle"}</th>
                <th className="p-2">{t("actions") || "İşlemler"}</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a._id} className="border-t hover:bg-blue-50">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{a.content.length > 40 ? a.content.slice(0, 40) + "..." : a.content}</td>
                  <td className="p-2">{a.date ? new Date(a.date).toLocaleDateString() : ""}</td>
                  <td className="p-2">{a.target === 'all' ? 'Tüm Kullanıcılar' : a.target === 'student' ? 'Sadece Öğrenciler' : 'Sadece Eğitmenler'}</td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-600 hover:underline" onClick={() => { setEditAnnouncement(a); setTarget(a.target); setModalOpen(true); }}>{t("edit") || "Düzenle"}</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(a._id!)}>{t("delete") || "Sil"}</button>
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
            <h2 className="text-xl font-bold mb-4 text-blue-800">{editAnnouncement?._id ? t("editAnnouncement") || "Duyuruyu Düzenle" : t("addAnnouncement") || "Duyuru Ekle"}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder={t("title") || "Başlık"} value={editAnnouncement?.title || ""} onChange={e => setEditAnnouncement(a => ({ ...a!, title: e.target.value }))} required />
              <textarea className="w-full border p-2 rounded" placeholder={t("content") || "İçerik"} value={editAnnouncement?.content || ""} onChange={e => setEditAnnouncement(a => ({ ...a!, content: e.target.value }))} required />
              <select className="w-full border p-2 rounded" value={target} onChange={e => setTarget(e.target.value as 'all' | 'student' | 'teacher')} required>
                <option value="all">Tüm Kullanıcılar</option>
                <option value="student">Sadece Öğrenciler</option>
                <option value="teacher">Sadece Eğitmenler</option>
              </select>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setModalOpen(false); setEditAnnouncement(null); }}>{t("cancel") || "İptal"}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t("save") || "Kaydet"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
