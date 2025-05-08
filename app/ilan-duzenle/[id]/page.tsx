"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface Ilan {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  frequency: string;
  status: string;
}

export default function IlanDuzenlePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchIlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/ilanlar/${params.id}`);
        if (!response.ok) {
          throw new Error("İlan bulunamadı");
        }
        const data = await response.json();
        setIlan(data);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchIlan();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!ilan) return;
    const { name, value, type } = e.target;
    // Ensure number fields are stored as numbers
    setIlan({ ...ilan, [name]: type === 'number' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // instructorFrom validation removed
    
    try {
      const token = localStorage.getItem("token");
      // Remove _id from the update payload to avoid MongoDB update errors
      if (!ilan) {
        setError("İlan bilgileri bulunamadı");
        return;
      }
      const { _id, ...updatePayload } = ilan;
      const response = await fetch(`/api/ilanlar/${params.id}?userId=${user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Güncelleme başarısız");
      }
      setSuccess("İlan başarıyla güncellendi!");
      setTimeout(() => router.push("/ilanlarim"), 1200);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!ilan) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-[#6B3416]">İlanı Düzenle</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Başlık</label>
          <input name="title" value={ilan.title} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Açıklama</label>
          <textarea name="description" value={ilan.description} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Ücret (₺/Saat)</label>
            <input type="number" name="price" value={ilan.price} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Yöntem</label>
            <select name="method" value={ilan.method} onChange={handleChange} className="w-full border px-3 py-2 rounded">
              <option value="online">Online</option>
              <option value="yüzyüze">Yüzyüze</option>
              <option value="hibrit">Hibrit</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Sıklık</label>
            <select name="frequency" value={ilan.frequency} onChange={handleChange} className="w-full border px-3 py-2 rounded">
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
              <option value="flexible">Esnek</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Durum</label>
          <select name="status" value={ilan.status} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
        {/* instructorFrom field removed */}
        {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => router.push("/ilanlarim")}
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#FF8B5E] text-white font-bold hover:bg-[#FF6B1A] transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFB996]"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
