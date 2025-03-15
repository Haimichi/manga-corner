import React from 'react';
import { Link } from 'react-router-dom';

const MangaCard = ({ manga }) => {
  // Kiểm tra manga có tồn tại không
  if (!manga || !manga.id) {
    return null;
  }

  // Lấy thông tin về ảnh bìa
  const getCoverImage = () => {
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    if (coverArt) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    }
    return 'https://via.placeholder.com/300x450?text=Không+có+ảnh';
  };

  // Lấy tiêu đề manga
  const getTitle = () => {
    return manga.attributes.title.vi || 
           manga.attributes.title.en || 
           'Không có tiêu đề';
  };

  return (
    <Link to={`/manga/${manga.id}`} className="block">
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
        <div className="relative h-64">
          <img
            src={getCoverImage()}
            alt={getTitle()}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-75"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-white font-bold truncate">{getTitle()}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;