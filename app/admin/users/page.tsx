'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/src/contexts/LanguageContext'
import { toast } from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  role: string
  university: string
  isVerified: boolean
  expertise?: string
  grade?: number
  createdAt: string
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { t } = useLanguage()
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?page=${page}&search=${searchTerm}`)
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      } else {
        toast.error(t('failedToLoadUsers') || 'Kullanıcılar yüklenemedi')
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, searchTerm])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm(t('confirmDeleteUser') || 'Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success(t('userDeleted') || 'Kullanıcı başarıyla silindi')
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.message || t('failedToDeleteUser') || 'Kullanıcı silinemedi')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) return
    
    try {
      const payload = { ...selectedUser }
      if (newPassword.length > 0) {
        payload.newPassword = newPassword
      }
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (response.ok) {
        toast.success(t('userUpdated') || 'Kullanıcı başarıyla güncellendi')
        setIsEditing(false)
        setNewPassword('')
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.message || t('failedToUpdateUser') || 'Kullanıcı güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!selectedUser) return
    
    const { name, value } = e.target
    setSelectedUser({
      ...selectedUser,
      [name]: value,
    })
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('users') || 'Kullanıcılar'}</h1>
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchUsers') || 'Kullanıcı Ara...'}
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

      {/* Kullanıcı düzenleme modalı */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('editUser') || 'Kullanıcı Düzenle'}</h2>
            <form onSubmit={handleSaveUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name') || 'Ad Soyad'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={selectedUser.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email') || 'E-posta'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role') || 'Rol'}
                </label>
                <select
                  name="role"
                  value={selectedUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="student">{t('student') || 'Öğrenci'}</option>
                  <option value="instructor">{t('instructor') || 'Eğitmen'}</option>
                  <option value="teacher">{t('teacher') || 'Öğretmen'}</option>
                  <option value="admin">{t('admin') || 'Admin'}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('university') || 'Üniversite'}
                </label>
                <input
                  type="text"
                  name="university"
                  value={selectedUser.university}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expertise') || 'Uzmanlık Alanı'}
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={selectedUser.expertise || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('grade') || 'Sınıf'}
                </label>
                <input
                  type="number"
                  name="grade"
                  value={selectedUser.grade || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="6"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPassword') || 'Yeni Şifre'}
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={t('leaveBlankToKeep') || 'Değiştirmek istemiyorsanız boş bırakın'}
                  minLength={6}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t('cancel') || 'İptal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('save') || 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kullanıcı tablosu */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name') || 'Ad Soyad'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('email') || 'E-posta'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('role') || 'Rol'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('university') || 'Üniversite'}
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
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 
                      user.role === 'teacher' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {user.role === 'admin' ? (t('admin') || 'Admin') :
                     user.role === 'instructor' ? (t('instructor') || 'Eğitmen') :
                     user.role === 'teacher' ? (t('teacher') || 'Öğretmen') :
                     (t('student') || 'Öğrenci')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.university}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isVerified ? (t('verified') || 'Doğrulanmış') : (t('notVerified') || 'Doğrulanmamış')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('edit') || 'Düzenle'}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('delete') || 'Sil'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default UsersPage
