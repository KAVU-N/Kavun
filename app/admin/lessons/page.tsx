'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/src/contexts/LanguageContext'
import { toast } from 'react-hot-toast'

interface Lesson {
  _id: string
  title: string
  courseId: string
  courseName?: string
  content: string
  duration: number
  order: number
  isPublished: boolean
  createdAt: string
}

const LessonsPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<{_id: string, title: string}[]>([])
  const { t } = useLanguage()
  
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/lessons?page=${page}&search=${searchTerm}`)
      
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons)
        setTotalPages(data.totalPages)
      } else {
        toast.error(t('failedToLoadLessons') || 'Dersler yüklenemedi')
        console.error('Failed to fetch lessons')
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, t])

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/courses?limit=100')
      
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      } else {
        toast.error(t('failedToLoadCourses') || 'Kurslar yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }, [t])

  useEffect(() => {
    fetchLessons()
    fetchCourses()
  }, [fetchLessons, fetchCourses])

  const handleCreateLesson = () => {
    setSelectedLesson({
      _id: '',
      title: '',
      courseId: '',
      content: '',
      duration: 0,
      order: 1,
      isPublished: false,
      createdAt: new Date().toISOString()
    })
    setIsCreating(true)
    setIsEditing(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsCreating(false)
    setIsEditing(true)
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm(t('confirmDeleteLesson') || 'Bu dersi silmek istediğinize emin misiniz?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success(t('lessonDeleted') || 'Ders başarıyla silindi')
        fetchLessons()
      } else {
        const data = await response.json()
        toast.error(data.message || t('failedToDeleteLesson') || 'Ders silinemedi')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    }
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLesson) return
    
    try {
      let response
      
      if (isCreating) {
        // Yeni ders oluştur
        response = await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedLesson),
        })
      } else {
        // Mevcut dersi güncelle
        response = await fetch(`/api/admin/lessons/${selectedLesson._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedLesson),
        })
      }
      
      if (response.ok) {
        toast.success(
          isCreating
            ? (t('lessonCreated') || 'Ders başarıyla oluşturuldu')
            : (t('lessonUpdated') || 'Ders başarıyla güncellendi')
        )
        setIsEditing(false)
        fetchLessons()
      } else {
        const data = await response.json()
        toast.error(
          data.message || 
          (isCreating
            ? (t('failedToCreateLesson') || 'Ders oluşturulamadı')
            : (t('failedToUpdateLesson') || 'Ders güncellenemedi'))
        )
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      toast.error(t('errorOccurred') || 'Bir hata oluştu')
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!selectedLesson) return
    
    const { name, value, type } = e.target
    
    // Sayısal değeri düzgün bir şekilde çevirme işlemi için
    if (name === 'duration' || name === 'order') {
      setSelectedLesson({
        ...selectedLesson,
        [name]: parseInt(value) || 0,
      })
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setSelectedLesson({
        ...selectedLesson,
        [name]: checked,
      })
    } else {
      setSelectedLesson({
        ...selectedLesson,
        [name]: value,
      })
    }
  }

  if (loading && lessons.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('lessons') || 'Dersler'}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchLessons') || 'Ders Ara...'}
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
          <button
            onClick={handleCreateLesson}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('createLesson') || 'Yeni Ders Ekle'}
          </button>
        </div>
      </div>

      {/* Ders düzenleme modalı */}
      {isEditing && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating 
                ? (t('createNewLesson') || 'Yeni Ders Oluştur')
                : (t('editLesson') || 'Ders Düzenle')}
            </h2>
            <form onSubmit={handleSaveLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('title') || 'Başlık'}
                </label>
                <input
                  type="text"
                  name="title"
                  value={selectedLesson.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('course') || 'Kurs'}
                </label>
                <select
                  name="courseId"
                  value={selectedLesson.courseId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">{t('selectCourse') || 'Kurs Seçin'}</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('content') || 'İçerik'}
                </label>
                <textarea
                  name="content"
                  value={selectedLesson.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={6}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('duration') || 'Süre (dakika)'}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={selectedLesson.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('order') || 'Sıralama'}
                  </label>
                  <input
                    type="number"
                    name="order"
                    min="1"
                    value={selectedLesson.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status') || 'Durum'}
                </label>
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={selectedLesson.isPublished}
                    onChange={(e) => {
                      setSelectedLesson({
                        ...selectedLesson,
                        isPublished: e.target.checked,
                      })
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    {t('published') || 'Yayınlandı'}
                  </label>
                </div>
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

      {/* Dersler tablosu */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('title') || 'Başlık'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('course') || 'Kurs'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('duration') || 'Süre'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('order') || 'Sıra'}
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
            {lessons.map((lesson) => (
              <tr key={lesson._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lesson.courseName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lesson.duration} {t('minutes') || 'dk'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{lesson.order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {lesson.isPublished 
                      ? (t('published') || 'Yayında') 
                      : (t('draft') || 'Taslak')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('edit') || 'Düzenle'}
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('delete') || 'Sil'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lessons.length === 0 && !loading && (
          <div className="py-8 text-center text-gray-500">
            {t('noLessons') || 'Henüz ders bulunmuyor'}
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

export default LessonsPage
