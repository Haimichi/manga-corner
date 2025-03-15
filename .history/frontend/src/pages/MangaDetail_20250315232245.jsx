import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { getMangaDetails } from '../services/mangadexApi';
import ChapterCard from '../components/ChapterCard';

const MangaDetail = () => {
  const { mangaId } = useParams();
  const dispatch = useDispatch();
  const { chapters, loading } = useSelector(state => state.mangadex);
  const [manga, setManga] = useState(null);
  const [loadingManga, setLoadingManga] = useState(true);
  const [error, setError] = useState(null);
  
  // Lấy danh sách chapter và thông tin về phân trang
  const mangaChapters = chapters[mangaId]?.data || [];
  const chapterPagination = chapters[mangaId]?.pagination || { hasMore: false };
  
  useEffect(() => {
    // Lấy thông tin chi tiết manga
    const fetchMangaInfo = async () => {
      try {
        setLoadingManga(true);
        const response = await getMangaDetails(mangaId);
        setManga(response.data);
        setLoadingManga(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin manga:', error);
        setError('Không thể tải thông tin manga');
        setLoadingManga(false);
      }
    };
    
    fetchMangaInfo();
    // Lấy danh sách chapter
    dispatch(fetchMangaChapters({ mangaId }));
  }, [dispatch, mangaId]);
  
  // Xử lý tải thêm chapter
  const handleLoadMoreChapters = () => {
    if (chapterPagination.hasMore && !loading) {
      dispatch(fetchMangaChapters({ 
        mangaId, 
        page: chapterPagination.page + 1 
      }));
    }
  };
  
  // Lấy ảnh bìa manga
  const getCoverImage = (manga) => {
    if (!manga || !manga.relationships) {
      return '/images/default-cover.jpg';
    }
    
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    
    if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
      return '/images/default-cover.jpg';
    }
    
    return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
  };
  
  // Lấy tiêu đề manga
  const getTitle = (manga) => {
    if (!manga || !manga.attributes || !manga.attributes.title) {
      return 'Không có tiêu đề';
    }
    
    // Ưu tiên tiếng Việt, sau đó tiếng Anh, cuối cùng là bất kỳ ngôn ngữ nào
    const { title } = manga.attributes;
    return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
  };
  
  // Lấy mô tả manga
  const getDescription = (manga) => {
    if (!manga || !manga.attributes || !manga.attributes.description) {
      return 'Không có mô tả';
    }
    
    const { description } = manga.attributes;
    return description.vi || description.en || Object.values(description)[0] || 'Không có mô tả';
  };
  
  if (loadingManga) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !manga) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Không tìm thấy manga'}
        </div>
        <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-800">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Thông tin manga */}
        <div className="md:w-1/3 lg:w-1/4">
          <img 
            src={getCoverImage(manga)} 
            alt={getTitle(manga)} 
            className="w-full h-auto rounded-lg shadow-md"
          />
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Tình trạng:</span>
              <span className="font-medium">{manga.attributes.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Năm xuất bản:</span>
              <span className="font-medium">{manga.attributes.year || 'Không rõ'}</span>
            </div>
          </div>
        </div>
        
        {/* Chi tiết và danh sách chapter */}
        <div className="md:w-2/3 lg:w-3/4">
          <h1 className="text-3xl font-bold mb-4">{getTitle(manga)}</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
            <div className="text-gray-700 space-y-2">
              {getDescription(manga).split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {/* Danh sách chapter */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Danh sách chương</h2>
            
            {mangaChapters.length === 0 && loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
              </div>
            ) : mangaChapters.length === 0 ? (
              <div className="text-gray-500 p-4 border border-gray-200 rounded-lg">
                Không có chương nào
              </div>
            ) : (
              <div className="space-y-2">
                {mangaChapters.map(chapter => (
                  <ChapterCard 
                    key={chapter.id} 
                    chapter={chapter} 
                    mangaId={mangaId} 
                  />
                ))}
              </div>
            )}
            
            {chapterPagination.hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMoreChapters}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm chương'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail; 