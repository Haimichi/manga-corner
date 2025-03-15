import React from 'react';
import { Link } from 'react-router-dom';

const MangaCard = ({ manga }) => {
  // Hàm helper lấy URL ảnh bìa manga
  const getCoverImage = (manga) => {
    const coverRelationship = manga.relationships?.find(rel => rel.type === 'cover_art');
    const fileName = coverRelationship?.attributes?.fileName;
    
    if (fileName) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`;
    }
    return 'https://via.placeholder.com/200x300?text=No+Cover';
  };

  // Hàm helper lấy tiêu đề manga
  const getMangaTitle = (manga) => {
    const titles = manga.attributes?.title || {};
    return titles.vi || titles.en || Object.values(titles)[0] || 'Không có tiêu đề';
  };

  return (
    <Link to={`/manga/${manga.id}`} className="block group">
      <div className="overflow-hidden rounded-md bg-gray-100 shadow-md transition-all hover:shadow-lg">
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={getCoverImage(manga)}
            alt={getMangaTitle(manga)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="mt-2 truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
            {getMangaTitle(manga)}
          </h3>
          <p className="mt-1 text-xs text-gray-600">
            {manga.attributes?.status === 'ongoing' ? 'Đang cập nhật' : 
             manga.attributes?.status === 'completed' ? 'Hoàn thành' : 
             manga.attributes?.status}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;