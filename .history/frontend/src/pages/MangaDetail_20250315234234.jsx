import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { getMangaDetails } from '../services/mangadexApi';
import ChapterCard from '../components/ChapterCard';

const MangaDetail = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { manga, chapters, loading, error } = useSelector((state) => state.mangadex);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Lấy danh sách chapter và thông tin về phân trang
  const mangaChapters = chapters[mangaId]?.data || [];
  const chapterPagination = chapters[mangaId]?.pagination || { hasMore: false };
  
  useEffect(() => {
    if (mangaId) {
      console.log("Đang tải thông tin cho manga:", mangaId);
      setLocalLoading(true);
      
      // Tải thông tin manga trước
      dispatch(getMangaDetailAsync(mangaId))
        .then((result) => {
          console.log("Đã tải xong thông tin manga:", result);
          
          // Sau đó tải chapters không chỉ định ngôn ngữ
          console.log("Đang tải chapters cho manga:", mangaId);
          return dispatch(fetchMangaChapters(mangaId));
        })
        .then((chaptersResult) => {
          console.log("Kết quả tải chapters:", chaptersResult);
        })
        .catch((error) => {
          console.error("Lỗi khi tải dữ liệu:", error);
        })
        .finally(() => {
          setLocalLoading(false);
        });
    }
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
    try {
      if (!manga || !manga.relationships) {
        console.log("Không có manga hoặc relationships");
        return '/images/default-cover.jpg';
      }
      
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        console.log("Không tìm thấy cover_art hoặc attributes hoặc fileName");
        return '/images/default-cover.jpg';
      }
      
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (error) {
      console.error("Lỗi khi lấy ảnh bìa:", error);
      return '/images/default-cover.jpg';
    }
  };
  
  // Lấy tiêu đề manga
  const getTitle = (manga) => {
    try {
      if (!manga || !manga.attributes || !manga.attributes.title) {
        return 'Không có tiêu đề';
      }
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      console.error("Lỗi khi lấy tiêu đề:", error);
      return 'Không có tiêu đề';
    }
  };
  
  // Lấy mô tả manga
  const getDescription = (manga) => {
    try {
      if (!manga || !manga.attributes || !manga.attributes.description) {
        return 'Không có mô tả';
      }
      
      const { description } = manga.attributes;
      return description.vi || description.en || Object.values(description)[0] || 'Không có mô tả';
    } catch (error) {
      console.error("Lỗi khi lấy mô tả:", error);
      return 'Không có mô tả';
    }
  };
  
  // Trong phần render, kiểm tra chapters
  const renderChapters = () => {
    console.log("Rendering chapters:", chapters);
    
    if (!chapters || chapters.length === 0) {
      return <p className="text-center text-gray-500">Không có chapter nào</p>;
    }
    
    return (
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div 
            key={chapter.id} 
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <a href={`/manga/${mangaId}/chapter/${chapter.id}`} className="block">
              Chapter {chapter.attributes?.chapter || '?'}: {chapter.attributes?.title || 'Không có tiêu đề'}
            </a>
          </div>
        ))}
      </div>
    );
  };
  
  if (localLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="loader">Đang tải...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }
  
  if (!manga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          Không tìm thấy thông tin manga
        </div>
      </div>
    );
  }
  
  const title = getTitle(manga);
  const description = getDescription(manga);
  const status = manga.attributes?.status || 'unknown';
  const coverImage = getCoverImage(manga);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full rounded-lg shadow-lg"
          />
          
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Thông tin</h3>
            <p><span className="font-medium">Trạng thái:</span> {status === 'ongoing' ? 'Đang tiến hành' : status === 'completed' ? 'Hoàn thành' : 'Không xác định'}</p>
            {/* Các thông tin khác */}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Tóm tắt</h2>
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Danh sách chapter</h2>
            {renderChapters()}
            
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