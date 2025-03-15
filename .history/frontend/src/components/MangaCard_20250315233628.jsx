import React from 'react';
import { Link } from 'react-router-dom';

const MangaCard = ({ manga }) => {
  // Thêm kiểm tra và log
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
  
  console.log(`MangaCard: ID=${manga.id}, Title=${title}`);
  
  return (
    <Link 
      to={`/manga/${manga.id}`} 
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative pb-[140%]">
        <img 
          src={coverImage} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-cover.jpg';
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default MangaCard;