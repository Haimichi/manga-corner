import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { 
  FaCalendarAlt, FaSort, FaSortAlphaDown, FaSortAlphaUp, 
  FaLanguage, FaSearch, FaChevronLeft, FaChevronRight,
  FaUsers, FaClock
} from 'react-icons/fa';
import SkeletonLoader from './SkeletonLoader';
import '../styles/animations.css';

const ChapterList = ({ mangaId }) => {
  const dispatch = useDispatch();
  const { chapters, chaptersLoading, chaptersError } = useSelector(state => state.mangadex);
  
  // State cho UI
  const [expandedChapters, setExpandedChapters] = useState({});
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' hoặc 'asc'
  const [filterLanguage, setFilterLanguage] = useState('all'); // 'all', 'vi', 'en', etc.
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersPerPage, setChaptersPerPage] = useState(15);
  
  useEffect(() => {
    if (mangaId) {
      dispatch(fetchMangaChapters(mangaId));
    }
  }, [dispatch, mangaId]);
  
  // Hàm nhóm chapters theo số chapter
  const groupChaptersByNumber = () => {
    const result = {};
    
    if (!chapters?.data || !Array.isArray(chapters.data)) {
      return {};
    }
    
    chapters.data.forEach(chapter => {
      const chapterNum = chapter.attributes.chapter || 'N/A';
      if (!result[chapterNum]) {
        result[chapterNum] = [];
      }
      result[chapterNum].push(chapter);
    });
    
    return result;
  };
  
  // Hàm lấy tên nhóm dịch
  const getScanlationGroupName = (chapter) => {
    try {
      if (!chapter || !chapter.relationships) return 'Unknown';
      
      const relationships = chapter.relationships || [];
      const group = relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || '@' + (group?.attributes?.username || 'Unknown');
    } catch (error) {
      return 'Unknown Group';
    }
  };
  
  // Hàm format ngày
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };
  
  // Hiển thị loading - sử dụng SkeletonLoader đã có
  if (chaptersLoading) {
    return <SkeletonLoader type="chapters" count={5} />;
  }
  
  // Hiển thị lỗi
  if (chaptersError) {
    return (
      <div className="bg-red-900 border border-red-800 p-4 rounded-md text-white">
        <p className="font-medium">Lỗi khi tải chapter: {chaptersError}</p>
        <button 
          className="mt-2 px-3 py-1 bg-red-800 text-white rounded-md hover:bg-red-700"
          onClick={() => dispatch(fetchMangaChapters(mangaId))}
        >
          Thử lại
        </button>
      </div>
    );
  }
  
  // Kiểm tra nếu không có chapters
  if (!chapters?.data || !Array.isArray(chapters.data) || chapters.data.length === 0) {
    return (
      <div className="bg-yellow-900 border border-yellow-800 p-6 rounded-lg text-yellow-200">
        <div className="flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center text-yellow-400 mb-2">Không có chapter nào cho truyện này</h3>
        <p className="text-center text-yellow-300">Có thể API chưa cập nhật hoặc chưa có bản dịch.</p>
        <div className="flex justify-center mt-4">
          <button 
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-yellow-100 rounded-lg transition"
            onClick={() => dispatch(fetchMangaChapters(mangaId))}
          >
            Tải lại chapters
          </button>
        </div>
      </div>
    );
  }
  
  // Nhóm chapters theo số chapter
  const groupedChapters = groupChaptersByNumber();
  
  // Lọc chapter theo ngôn ngữ
  const filteredChapterNumbers = Object.keys(groupedChapters).filter(chapterNum => {
    if (filterLanguage === 'all') return true;
    
    return groupedChapters[chapterNum].some(chapter => 
      chapter.attributes.translatedLanguage === filterLanguage
    );
  });
  
  // Lọc theo tìm kiếm
  const searchFilteredChapterNumbers = filteredChapterNumbers.filter(chapterNum => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    const chapters = groupedChapters[chapterNum];
    
    // Tìm theo số chapter
    if (chapterNum.toLowerCase().includes(searchTermLower)) return true;
    
    // Tìm theo tiêu đề
    return chapters.some(chapter => {
      const title = chapter.attributes.title || '';
      return title.toLowerCase().includes(searchTermLower);
    });
  });
  
  // Sắp xếp danh sách chapter
  const sortedChapterNumbers = [...searchFilteredChapterNumbers].sort((a, b) => {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    
    if (sortOrder === 'desc') {
      return numB - numA;
    } else {
      return numA - numB;
    }
  });
  
  // Phân trang
  const totalPages = Math.ceil(sortedChapterNumbers.length / chaptersPerPage);
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = sortedChapterNumbers.slice(indexOfFirstChapter, indexOfLastChapter);
  
  // Chuyển trang
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.getElementById('chapter-list-top').offsetTop - 100,
      behavior: 'smooth'
    });
  };
  
  // Tổng số chapter
  const totalChapters = sortedChapterNumbers.length;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden" id="chapter-list-top">
      <div className="bg-gray-700 px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-white font-medium mb-2 md:mb-0 flex items-center">
            <span className="mr-2">Danh sách chapter</span>
            <span className="bg-blue-600 text-xs rounded-full px-2 py-0.5 text-white">
              {totalChapters}
            </span>
          </h3>
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            {/* Nút sắp xếp */}
            <button 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className={`px-3 py-1.5 rounded flex items-center text-sm ${
                sortOrder === 'desc' 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-teal-900 text-teal-300'
              }`}
            >
              <FaSort className="mr-1.5" />
              {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
            </button>
            
            {/* Lọc ngôn ngữ */}
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-3 py-1.5 rounded text-sm bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả ngôn ngữ</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
              <option value="ja">Tiếng Nhật</option>
              <option value="zh">Tiếng Trung</option>
            </select>
          </div>
        </div>
        
        {/* Thanh tìm kiếm */}
        <div className="mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm chapter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Phân trang - phía trên */}
      {totalPages > 1 && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Hiển thị {indexOfFirstChapter + 1}-{Math.min(indexOfLastChapter, totalChapters)} trên {totalChapters} chapters
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md ${
                currentPage === 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Hiển thị 5 trang lân cận
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-md ${
                currentPage === totalPages 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Danh sách chapter */}
      <div className="divide-y divide-gray-700">
        {currentChapters.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Không tìm thấy chapter nào phù hợp với điều kiện tìm kiếm
          </div>
        ) : (
          currentChapters.map(chapterNum => {
            const chapterVersions = groupedChapters[chapterNum];
            const firstChapter = chapterVersions[0];
            
            return (
              <div key={chapterNum} className="p-4 hover:bg-gray-750 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/manga/${mangaId}/chapter/${firstChapter.id}`} 
                      className="text-blue-400 hover:text-blue-300 font-medium text-lg flex items-center"
                    >
                      <span className="bg-blue-900 text-blue-200 rounded px-2 py-0.5 text-sm mr-2">
                        Ch.{chapterNum}
                      </span>
                      {firstChapter.attributes.title || 'Không có tiêu đề'}
                    </Link>
                    
                    <div className="mt-2 flex flex-wrap items-center text-sm text-gray-400 gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <FaUsers className="mr-1.5 text-purple-400" />
                        {getScanlationGroupName(firstChapter)}
                      </div>
                      
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-yellow-500" />
                        {formatDate(firstChapter.attributes.publishAt)}
                      </div>
                      
                      <div className="flex items-center">
                        <FaClock className="mr-1.5 text-green-500" />
                        {new Date(firstChapter.attributes.updatedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      <div className="flex items-center">
                        <FaLanguage className="mr-1.5 text-blue-400" />
                        {firstChapter.attributes.translatedLanguage === 'vi' ? 'Tiếng Việt' :
                         firstChapter.attributes.translatedLanguage === 'en' ? 'Tiếng Anh' :
                         firstChapter.attributes.translatedLanguage === 'ja' ? 'Tiếng Nhật' :
                         firstChapter.attributes.translatedLanguage === 'zh' ? 'Tiếng Trung' :
                         firstChapter.attributes.translatedLanguage}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-0">
                    <Link 
                      to={`/manga/${mangaId}/chapter/${firstChapter.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition text-sm inline-block"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                </div>
                
                {/* Nếu có nhiều phiên bản của cùng 1 chapter (nhiều nhóm dịch) */}
                {chapterVersions.length > 1 && (
                  <div className="mt-3 pl-4">
                    <button
                      onClick={() => setExpandedChapters(prev => ({
                        ...prev,
                        [chapterNum]: !prev[chapterNum]
                      }))}
                      className="text-sm text-gray-400 hover:text-gray-300 flex items-center"
                    >
                      <FaChevronRight className={`mr-1 transition-transform duration-200 ${
                        expandedChapters[chapterNum] ? 'transform rotate-90' : ''
                      }`} />
                      {chapterVersions.length - 1} bản dịch khác
                    </button>
                    
                    {expandedChapters[chapterNum] && (
                      <div className="mt-2 pl-4 space-y-2 border-l border-gray-700">
                        {chapterVersions.slice(1).map(version => (
                          <div key={version.id} className="text-sm">
                            <Link 
                              to={`/manga/${mangaId}/chapter/${version.id}`}
                              className="text-gray-400 hover:text-blue-300 flex items-center"
                            >
                              <span className="bg-gray-700 text-gray-300 rounded px-2 py-0.5 text-xs mr-2">
                                Ch.{chapterNum}
                              </span>
                              <span className="flex-1">{getScanlationGroupName(version)}</span>
                              <span className="text-gray-500 text-xs ml-2">
                                {formatDate(version.attributes.publishAt)}
                              </span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Phân trang - phía dưới */}
      {totalPages > 1 && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Trang trước
              </button>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 px-4 py-2 rounded-md text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Trang sau
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Hiển thị <span className="font-medium">{indexOfFirstChapter + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastChapter, totalChapters)}</span> trong tổng số <span className="font-medium">{totalChapters}</span> chapter
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Nút Trang trước */}
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      currentPage === 1 
                        ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="sr-only">Trang trước</span>
                    <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Hiển thị số trang */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    // Tính toán số trang hiển thị (tối đa 5 trang)
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNum
                            ? 'border-blue-600 bg-blue-700 text-white font-medium z-10'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* Hiển thị "..." nếu có nhiều trang */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-gray-500">
                      ...
                    </span>
                  )}
                  
                  {/* Hiển thị trang cuối cùng nếu có nhiều trang */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {totalPages}
                    </button>
                  )}
                  
                  {/* Nút Trang sau */}
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      currentPage === totalPages 
                        ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="sr-only">Trang sau</span>
                    <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
          
          {/* Lựa chọn số chapter hiển thị mỗi trang */}
          <div className="mt-3 flex items-center">
            <span className="text-sm text-gray-400 mr-2">Hiển thị mỗi trang:</span>
            <select
              value={chaptersPerPage}
              onChange={(e) => {
                setChaptersPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng
              }}
              className="px-2 py-1 rounded text-sm bg-gray-900 text-gray-300 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterList;