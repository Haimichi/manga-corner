import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Thay thế import bằng biến chuỗi URL
const DEFAULT_COVER = 'data:image/jpeg;base64,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';

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
  let coverUrl = '';
  
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
  
  // Component SVG thay thế hình ảnh
  const NoCoverImage = ({ title }) => (
    <svg viewBox="0 0 160 240" className="w-full h-full">
      <rect width="160" height="240" fill="#f3f4f6" />
      <text
        x="80"
        y="120"
        fontFamily="Arial"
        fontSize="14"
        fill="#9ca3af"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {title.substring(0, 20)}{title.length > 20 ? '...' : ''}
      </text>
    </svg>
  );
  
  return (
    <Link to={`/manga/${manga.id}`} className="block">
      <div className="manga-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-w-2 aspect-h-3 bg-gray-200">
          {coverUrl && !imageError ? (
            <img 
              src={coverUrl} 
              alt={title}
              className="object-cover w-full h-full"
              onError={() => {
                console.log(`Hình ảnh lỗi, sử dụng placeholder cho: ${title}`);
                setImageError(true);
              }}
            />
          ) : (
            // Placeholder khi không có ảnh hoặc lỗi
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500 p-2">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-xs text-center">
                {title.substring(0, 30)}{title.length > 30 ? '...' : ''}
              </span>
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