'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Sayfalama
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  // Filtreler
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Kullanıcı öğretmen değilse ana sayfaya yönlendir
    if (user.role !== 'teacher') {
      router.push('/');
      return;
    }

    // Bakiye bilgisini getir
    fetchBalance();
    
    // İşlem geçmişini getir
    fetchTransactions();
  }, [user, router, page, typeFilter, statusFilter]);

  // Bakiye bilgisini getir
  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        setError('Bakiye bilgisi alınamadı');
      }
    } catch (error) {
      setError('Sunucu hatası');
    }
  };

  // İşlem geçmişini getir
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/api/wallet/transactions?page=${page}&limit=10`;
      
      if (typeFilter) {
        url += `&type=${typeFilter}`;
      }
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPrevPage(data.pagination.hasPrevPage);
      } else {
        setError('İşlem geçmişi alınamadı');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  // İşlem türünü Türkçe olarak göster
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Para Yükleme';
      case 'withdraw':
        return 'Para Çekme';
      case 'lesson_payment':
        return 'Ders Ödemesi';
      case 'lesson_earning':
        return 'Ders Kazancı';
      case 'refund':
        return 'İade';
      default:
        return type;
    }
  };

  // İşlem durumunu Türkçe olarak göster
  const getTransactionStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  // İşlem durumuna göre renk sınıfı
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // İşlem türüne göre renk sınıfı
  const getTypeColorClass = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'lesson_earning':
        return 'text-green-600';
      case 'withdraw':
      case 'lesson_payment':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // İşlem türüne göre + veya - işareti
  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'lesson_earning':
      case 'refund':
        return '+';
      case 'withdraw':
      case 'lesson_payment':
        return '-';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#994D1C] mb-8">Cüzdanım</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-600">Mevcut Bakiye</h2>
              <p className="text-3xl font-bold text-[#994D1C]">{balance.toFixed(2)} TL</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              <Link
                href="/profil/para-cek"
                className="inline-block bg-white border border-[#FF8B5E] text-[#FF8B5E] font-semibold py-2 px-6 rounded-md hover:bg-[#FFF8F2] transition-all duration-300"
              >
                Para Çek
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#994D1C] mb-6">İşlem Geçmişi</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                İşlem Türü
              </label>
              <select
                id="typeFilter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tümü</option>
                <option value="deposit">Para Yükleme</option>
                <option value="withdraw">Para Çekme</option>
                <option value="lesson_payment">Ders Ödemesi</option>
                <option value="lesson_earning">Ders Kazancı</option>
                <option value="refund">İade</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="statusFilter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="completed">Tamamlandı</option>
                <option value="failed">Başarısız</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF8B5E]"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Henüz hiç işlem bulunmuyor.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                          <div className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {getTransactionTypeText(transaction.type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.description}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getTypeColorClass(transaction.type)}`}>
                          {getAmountPrefix(transaction.type)}{transaction.amount.toFixed(2)} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(transaction.status)}`}>
                            {getTransactionStatusText(transaction.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Sayfa {page} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!hasPrevPage}
                    className={`px-4 py-2 rounded-md ${
                      hasPrevPage
                        ? 'bg-[#FFF8F2] text-[#FF8B5E] hover:bg-[#FFE6D5]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNextPage}
                    className={`px-4 py-2 rounded-md ${
                      hasNextPage
                        ? 'bg-[#FFF8F2] text-[#FF8B5E] hover:bg-[#FFE6D5]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
