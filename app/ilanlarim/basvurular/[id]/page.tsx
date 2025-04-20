"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Basvuru {
  _id: string;
  studentName: string;
  studentEmail: string;
  message: string;
  createdAt: string;
}

export default function IlanBasvurularPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBasvurular = async () => {
      try {
        setIsLoading(true);
        // Dummy API (gerçek API endpoint'in varsa burayı değiştir)
        const response = await fetch(`/api/basvurular?ilanId=${params.id}`);
        if (!response.ok) throw new Error("Başvurular getirilemedi");
        const data = await response.json();
        setBasvurular(data);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchBasvurular();
  }, [params.id]);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#6B3416]">Başvurular</h1>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : basvurular.length === 0 ? (
          <div className="text-[#994D1C]">Bu ilana henüz başvuru yok.</div>
        ) : (
          <ul className="space-y-4">
            {basvurular.map((b) => (
              <li key={b._id} className="bg-[#FFE5D9] p-4 rounded-lg shadow">
                <div className="font-semibold text-[#6B3416]">{b.studentName} ({b.studentEmail})</div>
                <div className="text-gray-700 whitespace-pre-line mt-2">{b.message}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(b.createdAt).toLocaleString("tr-TR")}</div>
              </li>
            ))}
          </ul>
        )}
        <button
          className="mt-8 px-4 py-2 rounded bg-[#FFB996] text-white font-semibold hover:bg-[#FF8B5E] transition"
          onClick={() => router.push("/ilanlarim")}
        >
          Geri Dön
        </button>
      </div>
    </div>
  );
}
