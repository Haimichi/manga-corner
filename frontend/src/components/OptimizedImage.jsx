import React, { useState, useEffect } from 'react';
import { createPlaceholder } from '../utils/imageHelper';

const OptimizedImage = ({ 
  src, 
  alt, 
  width = 400,
  height = 600,
  className = '',
  loading = 'lazy',
  placeholderText = null,
  onClick = null
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Sửa đường dẫn placeholders
  const fallbackImage = 'https://placehold.co/600x800/1f2937/ffffff?text=Không+có+ảnh';
  const loadingImage = 'https://placehold.co/600x800/1f2937/ffffff?text=Đang+tải...';
  
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      console.warn(`Lỗi khi tải ảnh: ${src}`);
      setError(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  const handleError = () => {
    console.log('Lỗi khi tải ảnh:', src);
    setImgSrc(fallbackImage);
    setError(true);
  };
  
  return (
    <div className={`relative overflow-hidden ${!isLoaded ? 'bg-gray-200 animate-pulse' : ''}`}>
      <img
        src={error ? fallbackImage : imgSrc}
        alt={alt || 'Manga image'}
        className={`transition duration-300 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        onClick={onClick}
        onError={handleError}
        style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover' }}
      />
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;