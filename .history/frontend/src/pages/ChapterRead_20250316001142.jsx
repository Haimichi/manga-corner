import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapterDetails, fetchChapterPages } from '../features/mangadex/mangadexSlice';

const ChapterRead = () => {
  const { mangaId, chapterId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { chapterDetails, chapterPages, loading } = useSelector(state => state.mangadex);
  const { chapters } = useSelector(state => state.mangadex);
  
  // State để quản lý việc tải hình ảnh
  const [loadedImages, setLoadedImages] = useState({});
  const [visiblePages, setVisiblePages] = useState([]);
  const observerRef = useRef(null);
  const pagesRef = useRef([]);
  
  // Lấy dữ liệu chapter hiện tại
  const chapter = chapterDetails[chapterId];
  const pages = chapterPages[chapterId] || [];
  
  // Lấy danh sách chapter của manga này để điều hướng giữa các chapter
  const mangaChapters = useMemo(() => chapters[mangaId]?.data || [], [chapters, mangaId]);
  
  useEffect(() => {
    // Reset trạng thái khi đổi chapter
    setLoadedImages({});
    setVisiblePages([]);
    
    dispatch(fetchChapterDetails(chapterId));
    dispatch(fetchChapterPages(chapterId));
    
    // Prefetch chapter kế tiếp
    const currentIndex = mangaChapters.findIndex(ch => ch.id === chapterId);
    if (currentIndex !== -1 && currentIndex < mangaChapters.length - 1) {
      const nextChapterId = mangaChapters[currentIndex + 1].id;
      // Prefetch dữ liệu chapter kế tiếp
      dispatch(fetchChapterDetails(nextChapterId));
    }
  }, [dispatch, chapterId, mangaChapters]);
  
  // Thiết lập Intersection Observer để lazy-load hình ảnh
  useEffect(() => {
    if (pages.length > 0) {
      // Hủy observer cũ nếu có
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Tạo observer mới
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const pageIndex = parseInt(entry.target.dataset.index);
          
          if (entry.isIntersecting) {
            // Thêm trang vào danh sách hiển thị
            setVisiblePages(prev => [...new Set([...prev, pageIndex])]);
          }
        });
      }, {
        rootMargin: '200px 0px', // Margin để load trước khi nhìn thấy
        threshold: 0.1
      });
      
      // Gắn observer vào các ref
      pagesRef.current.forEach(ref => {
        if (ref) observerRef.current.observe(ref);
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pages.length]);
  
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
      // Hiển thị loading và chuyển hướng
      navigate(`/manga/${mangaId}/chapter/${mangaChapters[targetIndex].id}`);
    }
  };
  
  const getChapterTitle = () => {
    if (!chapter) return 'Đang tải...';
    return `Chương ${chapter.attributes.chapter || '?'}: ${chapter.attributes.title || 'Không có tiêu đề'}`;
  };
  
  // Xử lý khi hình ảnh tải xong
  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({
      ...prev,
      [index]: true
    }));
  };
  
  // Xử lý khi hình ảnh lỗi
  const handleImageError = (index) => {
    console.error(`Không thể tải hình ảnh trang ${index + 1}`);
    setLoadedImages(prev => ({
      ...prev,
      [index]: 'error'
    }));
  };
  
  if (loading && (!chapter || pages.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="animate-spin h-14 w-14 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Đang tải chapter...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header cố định */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-10 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link to={`/manga/${mangaId}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Quay lại
            </Link>
            
            <h1 className="text-lg font-medium text-center truncate max-w-md mx-2">{getChapterTitle()}</h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => navigateToChapter('prev')}
                disabled={mangaChapters.findIndex(ch => ch.id === chapterId) <= 0}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                title="Chương trước"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => navigateToChapter('next')}
                disabled={mangaChapters.findIndex(ch => ch.id === chapterId) >= mangaChapters.length - 1}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                title="Chương sau"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nội dung chapter */}
      <div className="container mx-auto px-4 py-6">
        {/* Hiển thị trang */}
        {pages.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">Không có trang nào được tìm thấy cho chapter này.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 max-w-4xl mx-auto">
            {pages.map((page, index) => (
              <div 
                key={index}
                className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative min-h-[200px]"
                ref={el => pagesRef.current[index] = el}
                data-index={index}
              >
                {/* Placeholder khi chưa load */}
                {(!loadedImages[index] || !visiblePages.includes(index)) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="rounded-full h-10 w-10 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="mt-2 text-sm text-gray-500">Đang tải trang {index + 1}...</div>
                    </div>
                  </div>
                )}
                
                {/* Chỉ tải hình ảnh khi trang hiển thị trong viewport */}
                {visiblePages.includes(index) && (
                  <img
                    src={page.url}
                    alt={`Trang ${index + 1}`}
                    className={`w-full h-auto transition-opacity duration-300 ${loadedImages[index] === true ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                
                {/* Hiển thị thông báo lỗi nếu hình ảnh không tải được */}
                {loadedImages[index] === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900">
                    <div className="text-center p-4">
                      <div className="text-red-500 dark:text-red-400 text-2xl mb-2">⚠️</div>
                      <p className="text-red-600 dark:text-red-300">Không thể tải hình ảnh</p>
                      <button 
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => {
                          // Xóa trạng thái lỗi và thử tải lại
                          setLoadedImages(prev => ({ ...prev, [index]: false }));
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hiển thị số trang */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {index + 1}/{pages.length}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Điều hướng dưới cùng */}
        <div className="mt-8 flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={() => navigateToChapter('prev')}
            disabled={mangaChapters.findIndex(ch => ch.id === chapterId) <= 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Chương trước</span>
          </button>
          
          <Link
            to={`/manga/${mangaId}`}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Danh sách chương
          </Link>
          
          <button
            onClick={() => navigateToChapter('next')}
            disabled={mangaChapters.findIndex(ch => ch.id === chapterId) >= mangaChapters.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-1"
          >
            <span>Chương sau</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterRead;