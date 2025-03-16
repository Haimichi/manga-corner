import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import defaultCover from '../assets/images/no-cover.jpg'; // Tạo file ảnh này trong thư mục assets

// Sử dụng memo để tránh render lại các card không thay đổi
const MangaCard = memo(({ manga }) => {
  const [imageError, setImageError] = useState(false);
  
  // Log dữ liệu manga để kiểm tra
  console.log('MangaCard - Dữ liệu manga:', manga ? manga.id : 'không có dữ liệu');
  
  // Kiểm tra manga có tồn tại không
  if (!manga) {
    return (
      <div className="manga-card bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <span className="text-gray-400">Không có dữ liệu</span>
      </div>
    );
  }
  
  // Kiểm tra đầy đủ cấu trúc dữ liệu
  const title = manga.attributes?.title?.vi || 
                manga.attributes?.title?.en || 
                (manga.attributes?.title && Object.values(manga.attributes.title)[0]) || 
                manga.title || // Trường hợp schema khác
                'Không có tiêu đề';
  
  // Tạo URL hình ảnh an toàn
  let coverUrl = defaultCover;
  
  try {
    if (manga.relationships) {
      const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
      if (coverRel?.attributes?.fileName) {
        coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`;
      }
    } else if (manga.coverImage) {
      coverUrl = manga.coverImage;
    }
  } catch (error) {
    console.error('Lỗi khi tạo URL hình ảnh:', error);
  }
  
  return (
    <Link to={`/manga/${manga.id}`} className="block">
      <div className="manga-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-w-2 aspect-h-3 bg-gray-200">
          {!imageError ? (
            <img 
              src={coverUrl} 
              alt={title}
              className="object-cover w-full h-full"
              onError={() => {
                console.log(`Hình ảnh lỗi, sử dụng fallback cho: ${title}`);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs p-2 text-center">
              <span>{title.substring(0, 30)}{title.length > 30 ? '...' : ''}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2 h-10">{title}</h3>
        </div>
      </div>
    </Link>
  );
});

export default MangaCard;