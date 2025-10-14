"use client";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { toast } from "react-hot-toast";

interface ListingOwner {
  _id?: string;
  name?: string;
  email?: string;
  university?: string;
  role?: string;
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: "online" | "yüzyüze" | "hibrit";
  frequency: "daily" | "weekly" | "monthly" | "flexible";
  status: "active" | "inactive";
  userId: string;
  owner?: ListingOwner | null;
  createdAt?: string;
}

interface FormState {
  title: string;
  description: string;
  price: string;
  method: "online" | "yüzyüze" | "hibrit";
  frequency: "daily" | "weekly" | "monthly" | "flexible";
  status: "active" | "inactive";
  ownerEmail: string;
}

const defaultForm: FormState = {
  title: "",
  description: "",
  price: "",
  method: "online",
  frequency: "weekly",
  status: "active",
  ownerEmail: ""
};

const methodOptions: Array<FormState["method"]> = ["online", "yüzyüze", "hibrit"];
const frequencyOptions: Array<FormState["frequency"]> = ["daily", "weekly", "monthly", "flexible"];
const statusOptions: Array<FormState["status"]> = ["active", "inactive"];

export default function AdminListingsPage() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [editing, setEditing] = useState<Listing | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (appliedSearch) params.set("search", appliedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (methodFilter) params.set("method", methodFilter);
      const qs = params.toString();
      const res = await fetch(`/api/admin/listings${qs ? `?${qs}` : ""}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "İlanlar alınamadı");
      }
      const data = await res.json();
      setListings(data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "İlanlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, statusFilter, methodFilter]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormState(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (item: Listing) => {
    setEditing(item);
    setFormState({
      title: item.title,
      description: item.description,
      price: item.price?.toString() || "",
      method: item.method,
      frequency: item.frequency,
      status: item.status,
      ownerEmail: item.owner?.email || ""
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "İlan silinemedi");
      }
      toast.success("İlan silindi");
      fetchListings();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "İşlem başarısız");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      price: Number(formState.price),
      method: formState.method,
      frequency: formState.frequency,
      status: formState.status,
      ownerEmail: formState.ownerEmail.trim() || undefined
    };
    if (!payload.title || !payload.description || Number.isNaN(payload.price)) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    if (!editing && !payload.ownerEmail) {
      toast.error("İlan sahibi e-postası zorunludur");
      return;
    }
    try {
      const url = editing ? `/api/admin/listings/${editing._id}` : "/api/admin/listings";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "İşlem başarısız");
      }
      toast.success(editing ? "İlan güncellendi" : "İlan oluşturuldu");
      setModalOpen(false);
      setEditing(null);
      setFormState(defaultForm);
      fetchListings();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "İşlem başarısız");
    }
  };

  const formattedListings = useMemo(() => {
    return listings.map((listing) => ({
      ...listing,
      createdAtText: listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : ""
    }));
  }, [listings]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">{t("listings") || "İlanlar"}</h1>
          <p className="text-gray-600 text-sm">{t("manageListings") || "İlan kayıtlarını yönetin"}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          {t("addListing") || "İlan Oluştur"}
        </button>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder={t("search") || "Ara"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t("allStatuses") || "Tüm Durumlar"}</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "active" ? t("active") || "Aktif" : t("inactive") || "Pasif"}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">{t("allMethods") || "Tüm Yöntemler"}</option>
          {methodOptions.map((option) => (
            <option key={option} value={option}>
              {option === "online" ? t("online") || "Online" : option === "yüzyüze" ? t("faceToFace") || "Yüzyüze" : t("hybrid") || "Hibrit"}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t("search") || "Ara"}
        </button>
      </form>

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">{t("loading") || "Yükleniyor..."}</div>
        ) : formattedListings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{t("noListings") || "Gösterilecek ilan yok"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border bg-white">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">{t("title") || "Başlık"}</th>
                  <th className="p-3">{t("owner") || "İlan Sahibi"}</th>
                  <th className="p-3">{t("price") || "Ücret"}</th>
                  <th className="p-3">{t("method") || "Yöntem"}</th>
                  <th className="p-3">{t("frequency") || "Sıklık"}</th>
                  <th className="p-3">{t("status") || "Durum"}</th>
                  <th className="p-3">{t("date") || "Tarih"}</th>
                  <th className="p-3 text-right">{t("actions") || "İşlemler"}</th>
                </tr>
              </thead>
              <tbody>
                {formattedListings.map((listing) => (
                  <tr key={listing._id} className="border-t hover:bg-blue-50">
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{listing.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{listing.description}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-800">{listing.owner?.name || "-"}</div>
                      <div className="text-xs text-gray-500">{listing.owner?.email || ""}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{listing.price?.toLocaleString()} ₺</td>
                    <td className="p-3 text-sm text-gray-700">{listing.method === "online" ? t("online") || "Online" : listing.method === "yüzyüze" ? t("faceToFace") || "Yüzyüze" : t("hybrid") || "Hibrit"}</td>
                    <td className="p-3 text-sm text-gray-700">{listing.frequency}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${listing.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {listing.status === "active" ? t("active") || "Aktif" : t("inactive") || "Pasif"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{listing.createdAtText}</td>
                    <td className="p-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(listing)}
                        className="text-blue-600 hover:underline"
                      >
                        {t("edit") || "Düzenle"}
                      </button>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="text-red-600 hover:underline"
                      >
                        {t("delete") || "Sil"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-800">{editing ? t("editListing") || "İlanı Düzenle" : t("addListing") || "İlan Oluştur"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("title") || "Başlık"}
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <textarea
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder={t("description") || "Açıklama"}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="border rounded px-3 py-2"
                  placeholder={t("price") || "Ücret"}
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  required
                />
                <select
                  className="border rounded px-3 py-2"
                  value={formState.method}
                  onChange={(e) => setFormState({ ...formState, method: e.target.value as FormState["method"] })}
                >
                  {methodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "online" ? t("online") || "Online" : option === "yüzyüze" ? t("faceToFace") || "Yüzyüze" : t("hybrid") || "Hibrit"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="border rounded px-3 py-2"
                  value={formState.frequency}
                  onChange={(e) => setFormState({ ...formState, frequency: e.target.value as FormState["frequency"] })}
                >
                  {frequencyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-3 py-2"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value as FormState["status"] })}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "active" ? t("active") || "Aktif" : t("inactive") || "Pasif"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("ownerEmail") || "İlan Sahibi E-postası"}
                  value={formState.ownerEmail}
                  onChange={(e) => setFormState({ ...formState, ownerEmail: e.target.value })}
                  required={!editing}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                    setFormState(defaultForm);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {t("cancel") || "İptal"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t("save") || "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
