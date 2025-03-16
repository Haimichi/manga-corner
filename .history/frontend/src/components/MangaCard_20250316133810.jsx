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
          alt={manga.title?.en || manga.title?.ja || 'Manga cover'}
          effect="blur"
          className="absolute inset-0 w-full h-full object-cover"
          onError={handleImageError}
          wrapperClassName="absolute inset-0"
          threshold={200}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span className="inline-block px-2 py-1 bg-pink-600 text-white text-xs rounded-md">
            {manga.status}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 h-10">
          {manga.title?.en || manga.title?.ja || 'Không có tiêu đề'}
        </h3>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <span>{manga.year || 'N/A'}</span>
          <span className="truncate ml-2">{manga.author || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
});

export default MangaCard;