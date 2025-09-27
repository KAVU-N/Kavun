'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/src/contexts/LanguageContext'
import { toast } from 'react-hot-toast'

interface Payment {
  _id: string
  userId: string
  userName?: string
  userEmail?: string
  courseId: string
  courseName?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  transactionId: string
  createdAt: string
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { t } = useLanguage()
  
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/payments?page=${page}&search=${searchTerm}&status=${statusFilter}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
        setTotalPages(data.totalPages)
      } else {
        toast.error(t('failedToLoadPayments') || 'Ödemeler yüklenemedi')
        console.error('Failed to fetch payments')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, statusFilter, t])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsViewingDetails(true)
  }

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        toast.success(t('paymentStatusUpdated') || 'Ödeme durumu güncellendi')
        fetchPayments()
        if (isViewingDetails) {
          setIsViewingDetails(false)
        }
      } else {
        const data = await response.json()
        toast.error(data.message || t('failedToUpdatePayment') || 'Ödeme güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('completed') || 'Tamamlandı'
      case 'pending':
        return t('pending') || 'Beklemede'
      case 'failed':
        return t('failed') || 'Başarısız'
      case 'refunded':
        return t('refunded') || 'İade Edildi'
      default:
        return status
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('payments') || 'Ödemeler'}</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">{t('allStatuses') || 'Tüm Durumlar'}</option>
            <option value="completed">{t('completed') || 'Tamamlandı'}</option>
            <option value="pending">{t('pending') || 'Beklemede'}</option>
            <option value="failed">{t('failed') || 'Başarısız'}</option>
            <option value="refunded">{t('refunded') || 'İade Edildi'}</option>
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPayments') || 'Ödeme Ara...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-2 top-3 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Ödeme detay modalı */}
      {isViewingDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {t('paymentDetails') || 'Ödeme Detayları'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">{t('paymentId') || 'Ödeme ID'}</p>
                <p className="font-medium">{selectedPayment._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('transactionId') || 'İşlem ID'}</p>
                <p className="font-medium">{selectedPayment.transactionId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('date') || 'Tarih'}</p>
                <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('amount') || 'Tutar'}</p>
                <p className="font-medium text-lg">
                  {selectedPayment.currency === 'TRY' ? '₺' : '$'}
                  {selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('status') || 'Durum'}</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedPayment.status)}`}>
                    {getStatusText(selectedPayment.status)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('paymentMethod') || 'Ödeme Yöntemi'}</p>
                <p className="font-medium">{selectedPayment.paymentMethod || '-'}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <h3 className="font-medium mb-2">{t('customer') || 'Müşteri'}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">{t('name') || 'İsim'}</p>
                  <p className="font-medium">{selectedPayment.userName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('email') || 'E-posta'}</p>
                  <p className="font-medium">{selectedPayment.userEmail || '-'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <h3 className="font-medium mb-2">{t('course') || 'Kurs'}</h3>
              <div>
                <p className="text-sm text-gray-500">{t('courseName') || 'Kurs Adı'}</p>
                <p className="font-medium">{selectedPayment.courseName || '-'}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <h3 className="font-medium mb-2">{t('actions') || 'İşlemler'}</h3>
              <div className="flex space-x-2">
                {selectedPayment.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'completed')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {t('markAsCompleted') || 'Tamamlandı Olarak İşaretle'}
                  </button>
                )}
                {selectedPayment.status !== 'refunded' && selectedPayment.status === 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'refunded')}
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    {t('refund') || 'İade Et'}
                  </button>
                )}
                {selectedPayment.status !== 'failed' && selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'failed')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    {t('markAsFailed') || 'Başarısız Olarak İşaretle'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewingDetails(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                {t('close') || 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ödemeler tablosu */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('date') || 'Tarih'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('user') || 'Kullanıcı'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('course') || 'Kurs'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('amount') || 'Tutar'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status') || 'Durum'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions') || 'İşlemler'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(payment.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.userName || '-'}</div>
                  <div className="text-sm text-gray-500">{payment.userEmail || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.courseName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {payment.currency === 'TRY' ? '₺' : '$'}
                    {payment.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(payment)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {t('viewDetails') || 'Detaylar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && !loading && (
          <div className="py-8 text-center text-gray-500">
            {t('noPayments') || 'Henüz ödeme bulunmuyor'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('previous') || 'Önceki'}
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 border border-gray-300 bg-white text-sm font-medium 
                  ${page === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('next') || 'Sonraki'}
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default PaymentsPage
