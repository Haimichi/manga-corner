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
  const [imgSrc, setImgSrc] = useState(createPlaceholder(width, height, placeholderText));
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
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
  
  return (
    <div className={`relative overflow-hidden ${!isLoaded ? 'bg-gray-200 animate-pulse' : ''}`}>
      <img
        src={error ? createPlaceholder(width, height, placeholderText || alt) : imgSrc}
        alt={alt}
        className={`transition duration-300 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loading}
        onClick={onClick}
        onError={() => setError(true)}
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