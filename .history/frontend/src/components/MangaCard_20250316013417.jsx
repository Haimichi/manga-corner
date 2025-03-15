import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const MangaCard = React.memo(({ manga }) => {
  // Xử lý dữ liệu an toàn
  const getLocalizedValue = (objOrString, defaultValue = '') => {
    if (!objOrString) return defaultValue;
    if (typeof objOrString === 'string') return objOrString;
    if (typeof objOrString === 'object') {
      return objOrString.vi || objOrString.en || 
        (Object.keys(objOrString).length > 0 ? objOrString[Object.keys(objOrString)[0]] : defaultValue);
    }
    return defaultValue;
  };

  // Sử dụng useMemo để tính toán các giá trị chỉ khi manga thay đổi
  const { title, coverUrl, id } = useMemo(() => {
    if (!manga) return { title: 'Không có tiêu đề', coverUrl: null, id: null };
    
    const title = getLocalizedValue(manga.attributes?.title, 'Không có tiêu đề');
    const coverUrl = manga.coverUrl || null;
    const id = manga.id;
    
    return { title, coverUrl, id };
  }, [manga]);

  if (!id) return null;
  
  return (
    <Link to={`/manga/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-w-2 aspect-h-3 relative">
          <OptimizedImage
            src={coverUrl}
            alt={title}
            width={350}
            height={500}
            className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
            placeholderText={title}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-end p-3">
            <h3 className="text-white font-medium text-sm line-clamp-2">{title}</h3>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-2 h-12">{title}</h3>
        </div>
      </div>
    </Link>
  );
});

MangaCard.displayName = 'MangaCard';

export default MangaCard;