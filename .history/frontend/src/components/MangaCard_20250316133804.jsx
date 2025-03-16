import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Sử dụng memo để tránh render lại các card không thay đổi
const MangaCard = memo(({ manga }) => {
  const [imageError, setImageError] = useState(false);
  
  // Xử lý lỗi hình ảnh
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <Link 
      to={`/manga/${manga.id}`} 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
    >
      <div className="relative pb-[140%]">
        <LazyLoadImage
          src={imageError ? '/images/no-cover.png' : manga.coverUrl}
          alt={manga.title?.en || manga.title?.ja || 'Manga cover