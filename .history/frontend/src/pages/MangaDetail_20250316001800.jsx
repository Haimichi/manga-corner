import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MangaDetail = () => {
  const { mangaId } = useParams();
  const dispatch = useDispatch();
  const { manga, chapters, loading, error } = useSelector((state) => state.mangadex);
  const [localLoading, setLocalLoading] = useState(true);
  
  // State để lưu trữ chapter đã được phân loại
  const [vietnameseChapters, setVietnameseChapters] = useState([]);
  const [englishChapters, setEnglishChapters] = useState([]);
  
  // Thêm state để quản lý tab đang active
  const [activeTab, setActiveTab] = useState('vi');
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 10;
  
  // Lấy danh sách chapter và thông tin về phân trang
  const mangaChapters = chapters[mangaId]?.data || [];
  const chapterPagination = chapters[mangaId]?.pagination || { hasMore: false };
  
  // Thêm hình ảnh cờ
  // eslint-disable-next-line no-unused-vars
  const flagImages = {
    vi: '/images/flags/vietnam.png',
    en: '/images/flags/uk.png'
  };
  
  // Thêm state để theo dõi quá trình tải
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    if (mangaId) {
      console.log("Đang tải thông tin cho manga:", mangaId);
      setLocalLoading(true);
      
      // Thêm thông báo đang tải
      toast.info("Đang tải thông tin manga...");
      
      // Tải thông tin manga và chapters
      dispatch(getMangaDetailAsync(mangaId))
        .then(() => {
          toast.info("Đang tải danh sách chapter...");
          return dispatch(fetchMangaChapters(mangaId));
        })
        .then(() => {
          toast.success("Đã tải xong dữ liệu!");
        })
        .catch((error) => {
          toast.error(`Lỗi: ${error.message}`);
        })
        .finally(() => {
          setLocalLoading(false);
        });
    }
  }, [dispatch, mangaId]);
  
  // Phân loại chapter theo ngôn ngữ khi chapters thay đổi
  useEffect(() => {
    if (chapters && chapters.length > 0) {
      console.log(`Phân loại ${chapters.length} chapter theo ngôn ngữ`);
      
      // Phân loại chapters theo ngôn ngữ
      const viChapters = chapters.filter(chapter => chapter.attributes.translatedLanguage === 'vi');
      const enChapters = chapters.filter(chapter => chapter.attributes.translatedLanguage === 'en');
      
      console.log(`Tìm thấy ${viChapters.length} chapter tiếng Việt và ${enChapters.length} chapter tiếng Anh`);
      
      // Sắp xếp chapter theo số chapter (mới nhất trước)
      const sortChapters = (a, b) => {
        const chapterA = parseFloat(a.attributes.chapter) || 0;
        const chapterB = parseFloat(b.attributes.chapter) || 0;
        return chapterB - chapterA;
      };
      
      setVietnameseChapters(viChapters.sort(sortChapters));
      setEnglishChapters(enChapters.sort(sortChapters));
      
      setLoadingProgress(100); // Đã tải xong
      setCurrentPage(1); // Reset về trang đầu tiên khi đổi tab
    } else {
      setVietnameseChapters([]);
      setEnglishChapters([]);
    }
  }, [chapters]);
  
  // Reset trang khi đổi tab
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
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
  
  // Lấy mô tả manga
  const getAuthors = (manga) => {
    try {
      if (!manga || !manga.relationships) {
        return [];
      }
      
      return manga.relationships
        .filter(rel => rel.type === 'author' || rel.type === 'artist')
        .map(rel => rel.attributes?.name || 'Không rõ tác giả')
        .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
    } catch (error) {
      return [];
    }
  };
  
  // Lấy chapters hiện tại dựa trên tab và phân trang
  const getCurrentChapters = () => {
    const allChapters = activeTab === 'vi' ? vietnameseChapters : englishChapters;
    const indexOfLastChapter = currentPage * chaptersPerPage;
    const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
    
    return allChapters.slice(indexOfFirstChapter, indexOfLastChapter);
  };
  
  // Tính tổng số trang
  const totalPages = Math.ceil(
    (activeTab === 'vi' ? vietnameseChapters.length : englishChapters.length) / chaptersPerPage
  );
  
  // Chuyển đến trang khác
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Component phân trang
  const Pagination = () => {
    // Nếu chỉ có 1 trang hoặc không có chapter, không hiển thị phân trang
    if (totalPages <= 1) return null;
    
    // Hiển thị tối đa 5 nút trang
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Điều chỉnh startPage nếu endPage đã là trang cuối
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Phân trang">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
              currentPage === 1 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="sr-only">Trang trước</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => paginate(1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === number
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              <button
                onClick={() => paginate(totalPages)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
              currentPage === totalPages
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="sr-only">Trang sau</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    );
  };
  
  // Hàm render danh sách chapter theo ngôn ngữ
  const renderChapterList = () => {
    const currentChapters = getCurrentChapters();
    
    if (currentChapters.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center my-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Không có chapter {activeTab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'} cho manga này
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3 my-6">
        {currentChapters.map((chapter) => {
          // Lấy thông tin nhóm dịch
          const scanlationGroup = chapter.relationships?.find(r => r.type === 'scanlation_group');
          const groupName = scanlationGroup?.attributes?.name || 'Không rõ nhóm dịch';
          
          // Format ngày
          const publishDate = new Date(chapter.attributes.publishAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <div 
              key={chapter.id} 
              className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            >
              <a href={`/manga/${mangaId}/chapter/${chapter.id}`} className="block">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0 flex items-center">
                    <div>
                      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Chapter {chapter.attributes?.chapter || '?'}
                      </span>
                      {chapter.attributes?.title && (
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          - {chapter.attributes.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="hidden sm:inline-block mr-3">{publishDate}</span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
                      {groupName}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (localLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Đang tải thông tin manga...</p>
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
          <div className="text-red-500 text-3xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin manga</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manga này có thể không tồn tại hoặc đã bị xóa.
          </p>
          <a 
            href="/" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }
  
  const title = getTitle(manga);
  const description = getDescription(manga);
  const status = manga.attributes?.status || 'unknown';
  const coverImage = getCoverImage(manga);
  const authors = getAuthors(manga);
  
  // Map trạng thái thành tiếng Việt
  const statusMap = {
    ongoing: 'Đang tiến hành',
    completed: 'Hoàn thành',
    hiatus: 'Tạm ngừng',
    cancelled: 'Đã hủy',
    unknown: 'Không xác định'
  };
  
  return (
    <div>
      {/* Hero section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }}></div>
        <div className="container mx-auto h-full flex items-end px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end pb-6 md:pb-8 md:space-x-6">
            <div className="w-32 md:w-48 h-auto -mt-16 md:-mt-32 rounded-lg shadow-xl overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800">
              <img 
                src={coverImage} 
                alt={title} 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h1>
              <div className="flex flex-wrap items-center mb-1">
                {authors.map((author, index) => (
                  <span key={index} className="text-gray-200 mr-2">
                    {author}{index < authors.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap mt-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium mr-2 mb-2">
                  {statusMap[status] || statusMap.unknown}
                </span>
                {manga.attributes?.year && (
                  <span className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium mr-2 mb-2">
                    {manga.attributes.year}
                  </span>
                )}
                {/* Thể loại */}
                {manga.attributes?.tags?.filter(tag => tag.type === 'tag').map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium mr-2 mb-2">
                    {tag.attributes?.name?.vi || tag.attributes?.name?.en || ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Thông tin</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
                  <span className="ml-2">{statusMap[status] || statusMap.unknown}</span>
                </div>
                
                {manga.attributes?.year && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Năm phát hành:</span>
                    <span className="ml-2">{manga.attributes.year}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tác giả:</span>
                  <div className="mt-1">
                    {authors.length > 0 ? authors.map((author, index) => (
                      <div key={index} className="text-gray-600 dark:text-gray-400">{author}</div>
                    )) : (
                      <div className="text-gray-600 dark:text-gray-400">Không rõ tác giả</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Tóm tắt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Tóm tắt</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
            
            {/* Danh sách chapter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Danh sách chapter</h2>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  className={`py-2 px-4 font-medium border-b-2 transition ${
                    activeTab === 'vi'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('vi')}
                >
                  Tiếng Việt ({vietnameseChapters.length})
                </button>
                <button
                  className={`py-2 px-4 font-medium border-b-2 transition ${
                    activeTab === 'en'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('en')}
                >
                  Tiếng Anh ({englishChapters.length})
                </button>
              </div>
              
              {/* Hiển thị chapters */}
              {renderChapterList()}
              
              {/* Phân trang */}
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail; 