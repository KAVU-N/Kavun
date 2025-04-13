'use client';

import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

interface Review {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsListProps {
  teacherId: string;
  limit?: number;
  showPagination?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  teacherId,
  limit = 5,
  showPagination = true
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Sayfalama
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [teacherId, page, limit]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?teacherId=${teacherId}&page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Değerlendirmeler getirilemedi');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
      setHasPrevPage(data.pagination.hasPrevPage);
    } catch (err) {
      console.error('Değerlendirmeler yüklenirken hata:', err);
      setError('Değerlendirmeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-md">
        <p>{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-red-600 underline"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-bold text-[#994D1C]">Değerlendirmeler</h3>
        
        <div className="mt-2 md:mt-0 flex items-center">
          <span className="text-2xl font-bold text-[#994D1C] mr-2">
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(averageRating)} readonly size="md" />
          <span className="ml-2 text-gray-500">({totalReviews} değerlendirme)</span>
        </div>
      </div>
      
      {reviews.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-md text-center">
          <p className="text-gray-500">Henüz değerlendirme yapılmamış.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#FFE6D5] flex items-center justify-center text-[#994D1C] font-bold mr-3">
                    {review.studentId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-medium">{review.studentId?.name || 'İsimsiz Öğrenci'}</h4>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              <div className="mt-3 text-gray-700 whitespace-pre-line">
                {review.comment}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showPagination && totalPages > 1 && (
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
      )}
    </div>
  );
};

export default ReviewsList;
