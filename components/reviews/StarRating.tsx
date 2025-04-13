'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  setRating, 
  size = 'md', 
  readonly = false,
  className = ''
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (index: number) => {
    if (!readonly && setRating) {
      setRating(index + 1);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          onClick={() => handleClick(index)}
          className={`${readonly ? '' : 'cursor-pointer'} p-1`}
        >
          <svg
            className={`${sizeClass[size]} ${
              index < rating
                ? 'text-[#FFB996] fill-current'
                : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default StarRating;
