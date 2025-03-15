import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapterDetails, fetchChapterPages } from '../features/mangadex/mangadexSlice';

const ChapterRead = () => {
  const { mangaId, chapterId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { chapterDetails, chapterPages, loading } = useSelector(state => state.mangadex);
  const { chapters } = useSelector(state => state.mangadex);
  
  // Lấy dữ liệu chapter hiện tại
  const chapter = chapterDetails[chapterId];
  const pages = chapterPages[chapterId] || [];
  
  // Lấy danh sách chapter của manga này để điều hướng giữa các chapter
  const mangaChapters = chapters[mangaId]?.data || [];
  
  useEffect(() => {
    dispatch(fetchChapterDetails(chapterId));
    dispatch(fetchChapterPages(chapterId));
  }, [dispatch, chapterId]);
  
  // Hàm điều hướng đến chapter trước/sau
  const navigateToChapter = (direction) => {
    if (mangaChapters.length === 0) return;
    
    const currentIndex = mangaChapters.findIndex(ch => ch.id === chapterId);
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'prev') {
      targetIndex = currentIndex - 1;
    } else {
      targetIndex = currentIndex + 1;
    }
    
    if (targetIndex >= 0 && targetIndex < mangaChapters.length) {
      navigate(`/manga/${mangaId}/chapter/${mangaChapters[targetIndex].id}`);
    }
  };
  
  const getChapterTitle = () => {
    if (!chapter) return 'Đang tải...';
    return `Chương ${chapter.attributes.chapter || '?'}: ${chapter.attributes.title || 'Không có tiêu đề'}`;
  };
  
  if (loading && (!chapter || pages.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tiêu đề và điều hướng */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link to={`/manga/${mangaId}`} className="text-primary-600 hover:text-primary-800">
            ← Quay lại danh sách chương
          </Link>
          
          <div className="flex space-x-4">
            <button
              onClick={() => navigateToChapter('prev')}
              disabled={mangaChapters.findIndex(ch => ch.id === chapterId) <= 0}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              ← Chương trước
            </button>
            
            <button
              onClick={() => navigateToChapter('next')}
              disabled={mangaChapters.findIndex(ch => ch.id === chapterId) >= mangaChapters.length - 1}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Chương sau →
            </button>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mt-4">{getChapterTitle()}</h1>
      </div>
      
      {/* Hiển thị trang */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Không có trang nào được tìm thấy cho chapter này.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {pages.map((page, index) => (
            <div key={index} className="w-full max-w-3xl">
              <img
                src={page.url}
                alt={`Trang ${index + 1}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Điều hướng dưới cùng */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigateToChapter('prev')}
          disabled={mangaChapters.findIndex(ch => ch.id === chapterId) <= 0}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ← Chương trước
        </button>
        
        <Link
          to={`/manga/${mangaId}`}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Quay lại danh sách chương
        </Link>
        
        <button
          onClick={() => navigateToChapter('next')}
          disabled={mangaChapters.findIndex(ch => ch.id === chapterId) >= mangaChapters.length - 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Chương sau →
        </button>
      </div>
    </div>
  );
};

export default ChapterRead;