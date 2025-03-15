import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MangaCard = ({ manga }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  
  // Đảm bảo manga hợp lệ
  if (!manga || !manga.id) {
    console.error("MangaCard nhận được manga không hợp lệ:", manga);
    return null;
  }
  
  // Hàm lấy ảnh bìa an toàn
  const getCoverImage = () => {
    try {
      if (!manga.relationships) return '/images/default-cover.jpg';
      
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return '/images/default-cover.jpg';
      }
      
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (error) {
      console.error("Lỗi khi lấy ảnh bìa cho manga:", manga.id, error);
      return '/images/default-cover.jpg';
    }
  };
  
  // Hàm lấy tiêu đề an toàn
  const getTitle = () => {
    try {
      if (!manga.attributes || !manga.attributes.title) return 'Không có tiêu đề';
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      console.error("Lỗi khi lấy tiêu đề cho manga:", manga.id, error);
      return 'Không có tiêu đề';
    }
  };
  
  const coverImage = getCoverImage();
  const title = getTitle();
  
  // Sử dụng Intersection Observer để lazy-load hình ảnh
  useEffect(() => {
    // Tạo observer mới để theo dõi khi nào card được hiển thị trong viewport
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Khi card hiển thị trong viewport, tải hình ảnh
          const img = new Image();
          img.src = coverImage;
          img.onload = () => setImageLoaded(true);
          img.onerror = () => setImageError(true);
          
          // Ngừng theo dõi sau khi đã bắt đầu tải
          observerRef.current.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // Bắt đầu tải khi còn cách 200px
    );
    
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [coverImage]);
  
  // Kiểm tra có tag mới cập nhật không
  const isUpdatedRecently = () => {
    try {
      if (!manga.attributes || !manga.attributes.updatedAt) return false;
      
      const updatedAt = new Date(manga.attributes.updatedAt);
      const now = new Date();
      const diffTime = Math.abs(now - updatedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 3; // Được cập nhật trong 3 ngày gần đây
    } catch (error) {
      return false;
    }
  };
  
  return (
    <Link 
      to={`/manga/${manga.id}`} 
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden group relative"
    >
      <div className="relative pb-[140%] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {/* Placeholder trước khi hình ảnh tải */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 animate-spin"></div>
          </div>
        )}
        
        {/* Hiển thị hình ảnh khi đã tải */}
        <div 
          ref={imgRef}
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        ></div>
        
        <img 
          src={imageLoaded ? coverImage : '/images/default-cover.jpg'} 
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-cover.jpg';
            setImageError(true);
          }}
        />
        
        {/* Tag mới cập nhật */}
        {isUpdatedRecently() && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            Mới
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 h-10">
          {title}
        </h3>
        {manga.attributes?.year && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {manga.attributes.year}
          </div>
        )}
      </div>
    </Link>
  );
};

export default React.memo(MangaCard);