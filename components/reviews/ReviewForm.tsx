'use client';

import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import StarRating from './StarRating';

interface ReviewFormProps {
  lessonId: string;
  teacherId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  lessonId,
  teacherId,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formu doğrula
    if (rating === 0) {
      setError('Lütfen bir puan verin');
      return;
    }
    
    if (comment.trim().length < 3) {
      setError('Yorum en az 3 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          teacherId,
          rating,
          comment
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setRating(0);
        setComment('');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(data.error || 'Değerlendirme gönderilirken bir hata oluştu');
        
        if (onError) {
          onError(data.error || 'Değerlendirme gönderilirken bir hata oluştu');
        }
      }
    } catch (err) {
      const errorMessage = 'Değerlendirme gönderilirken bir hata oluştu';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Öğrenci değilse veya giriş yapılmamışsa formu gösterme
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-[#994D1C] mb-4">Eğitmeni Değerlendir</h3>
      
      {success ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-md">
          <p className="font-medium">Teşekkürler!</p>
          <p>Değerlendirmeniz başarıyla gönderildi.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Puanınız
            </label>
            <StarRating 
              rating={rating} 
              setRating={setRating} 
              size="lg" 
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Yorumunuz
            </label>
            <textarea
              id="comment"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8B5E]"
              rows={4}
              placeholder="Eğitmen hakkında düşüncelerinizi paylaşın..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
