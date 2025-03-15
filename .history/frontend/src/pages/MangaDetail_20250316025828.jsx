import React, { useState, useEffect, useCallback, useMemo, Suspense, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters, resetChapters } from '../features/mangadex/mangadexSlice';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  FaEye, FaRegClock, FaUser, FaCommentAlt, FaAngleDown, FaAngleUp, 
  FaBookmark, FaShare, FaStar, FaExclamationTriangle, FaExternalLinkAlt,
  FaRandom, FaChevronLeft, FaChevronRight, FaRegStar, FaCalendarAlt, FaTag, FaLanguage, FaInfoCircle
} from 'react-icons/fa';
import { HiChevronDown, HiX } from 'react-icons/hi';
import ErrorBoundary from '../components/ErrorBoundary';
import OptimizedImage from '../components/OptimizedImage';
import ChapterList from '../components/ChapterList';
import { Dialog, Transition } from '@headlessui/react';

// Component mới cho Skeleton Loading
const MangaDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-6 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 mb-10">
      <div className="w-full md:w-1/3 lg:w-1/4 h-[500px] bg-gray-300 rounded-lg"></div>
      <div className="w-full md:w-2/3 lg:w-3/4">
        <div className="h-10 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
        
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="bg-gray-200 h-12 rounded-t-lg mb-1"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-gray-100 h-20 rounded-none mb-1"></div>
    ))}
  </div>
);

// Component cho thông tin
const MangaInfo = ({ manga, getLocalizedValue }) => {
  const status = manga.attributes?.status || 'unknown';
  const statusMap = {
    'ongoing': 'Đang tiến hành',
    'completed': 'Đã hoàn thành',
    'hiatus': 'Tạm ngừng',
    'cancelled': 'Đã hủy',
    'unknown': 'Không rõ'
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-8 mb-10">
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
        <div className="relative group">
          <OptimizedImage 
            src={getCoverImage(manga)} 
            alt={getLocalizedValue(manga.attributes?.title)} 
            className="w-full object-cover rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center">
              <FaExternalLinkAlt className="text-white text-4xl mb-2" />
              <span className="text-white font-bold">Xem ảnh đầy đủ</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            <FaBookmark /> Theo dõi
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            <FaRandom /> Đọc ngẫu nhiên
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
            <FaShare /> Chia sẻ
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold border-b pb-2 mb-2">Thông tin</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Trạng thái:</span>
              <span className="font-medium ml-2">{statusMap[status]}</span>
            </div>
            <div>
              <span className="text-gray-600">Năm phát hành:</span>
              <span className="font-medium ml-2">{manga.attributes?.year || 'Không rõ'}</span>
            </div>
            <div>
              <span className="text-gray-600">Đánh giá:</span>
              <div className="flex items-center ml-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.round(manga.attributes?.rating?.bayesian || 0) / 2 ? 'text-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="ml-1">({manga.attributes?.rating?.bayesian?.toFixed(2) || 'N/A'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-2/3 lg:w-3/4">
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getLocalizedValue(manga.attributes?.title)}</h1>
          <div className="text-sm text-gray-500 mt-1">
            {manga.attributes?.altTitles?.map((title, index) => (
              <span key={index}>{getLocalizedValue(title)}{index < manga.attributes.altTitles.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {manga.attributes?.tags?.map(tag => (
            <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {getLocalizedValue(tag.attributes?.name)}
            </span>
          ))}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Tóm tắt</h3>
          <div className="prose prose-lg max-w-none bg-white rounded-lg p-4 shadow-sm">
            <p>{getLocalizedValue(manga.attributes?.description, 'Không có mô tả')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold border-b pb-2 mb-2">Tác giả</h3>
            <div className="space-y-1">
              {manga.relationships?.filter(rel => rel.type === 'author').map(author => (
                <div key={author.id} className="flex items-center">
                  <FaUser className="text-gray-500 mr-2" />
                  <span>{author.attributes?.name || 'Tác giả không xác định'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold border-b pb-2 mb-2">Thông tin xuất bản</h3>
            <div className="space-y-1">
              <div>
                <span className="text-gray-600">Nhà xuất bản:</span>
                <span className="font-medium ml-2">
                  {manga.relationships?.find(rel => rel.type === 'publisher')?.attributes?.name || 'Không rõ'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ngôn ngữ gốc:</span>
                <span className="font-medium ml-2">
                  {manga.attributes?.originalLanguage === 'ja' ? 'Tiếng Nhật' : 
                   manga.attributes?.originalLanguage === 'ko' ? 'Tiếng Hàn' :
                   manga.attributes?.originalLanguage === 'zh' ? 'Tiếng Trung' :
                   manga.attributes?.originalLanguage || 'Không rõ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Đổi tên từ ChapterList thành InlineChapterList
const InlineChapterList = ({ chapters, mangaId }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState('all'); // 'all', 'vi', 'en'
  const chaptersPerPage = 20;
  
  // Mảng các cờ quốc gia
const FLAGS = {
  'vi': '🇻🇳',
  'en': '🇬🇧',
  'es': '🇪🇸',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'zh': '🇨🇳',
  'fr': '🇫🇷',
  'de': '🇩🇪',
    'it': '🇮🇹',
  'pt-br': '🇧🇷',
  'ru': '🇷🇺'
};

  // Nhóm chapters theo số chapter
  const groupChaptersByNumber = (chaptersArray) => {
    if (!chaptersArray || !Array.isArray(chaptersArray)) return {};
    
    const grouped = {};
    chaptersArray.forEach(chapter => {
      try {
        if (!chapter || !chapter.attributes) return;
        const chapterNum = chapter.attributes.chapter || 'unknown';
        
        // Lọc theo ngôn ngữ nếu đã chọn
        if (language !== 'all' && chapter.attributes.translatedLanguage !== language) return;
        
        if (!grouped[chapterNum]) {
          grouped[chapterNum] = [];
        }
        grouped[chapterNum].push(chapter);
      } catch (error) {
        console.error('Lỗi khi nhóm chapter:', error);
      }
    });
    return grouped;
  };

  const isChaptersArray = Array.isArray(chapters);
  const groupedChapters = groupChaptersByNumber(isChaptersArray ? chapters : []);
  
  // Sắp xếp các số chapter theo thứ tự giảm dần
  const sortedChapterNumbers = Object.keys(groupedChapters).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return parseFloat(b) - parseFloat(a);
  });

  // Phân trang
  const totalPages = Math.ceil(sortedChapterNumbers.length / chaptersPerPage);
  const currentChapters = sortedChapterNumbers.slice(
    (currentPage - 1) * chaptersPerPage,
    currentPage * chaptersPerPage
  );
  
  // Các hàm điều hướng
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Hàm toggle mở rộng chapter
  const toggleChapterExpand = (chapterNum) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  // Hàm lấy thời gian đăng
  const formatPublishTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    } catch {
      return 'N/A';
    }
  };
  
  // Hàm lấy tên nhóm dịch
  const getScanlationGroupName = (chapter) => {
    try {
      if (!chapter || !chapter.relationships) return 'Unknown';
      const group = chapter.relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };
  
  if (!isChaptersArray || chapters.length === 0) {
      return (
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-800 font-bold text-xl">Danh sách chapter</div>
        <div className="p-10 text-center">
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
          <p className="text-xl">Không có chapter nào cho truyện này</p>
          <p className="text-gray-400 mt-2">Có thể API chưa cập nhật hoặc chưa có bản dịch</p>
        </div>
        </div>
      );
    }

    return (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="text-xl font-bold">Danh sách chapter</div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => { setLanguage('all'); setCurrentPage(1); }}
              className={`px-3 py-1 ${language === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => { setLanguage('vi'); setCurrentPage(1); }}
              className={`px-3 py-1 flex items-center ${language === 'vi' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button 
              onClick={() => { setLanguage('en'); setCurrentPage(1); }}
              className={`px-3 py-1 flex items-center ${language === 'en' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
      
      {currentChapters.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-xl">Không có chapter nào cho ngôn ngữ này</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {currentChapters.map(chapterNum => {
            const chapterGroup = groupedChapters[chapterNum];
            const isExpanded = expandedChapters[chapterNum] !== false;

          return (
              <div key={chapterNum} className="bg-gray-900 transition-colors duration-150">
                {/* Header của nhóm chapter */}
                <div 
                  onClick={() => toggleChapterExpand(chapterNum)}
                  className="p-4 bg-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <FaEye className="mr-2 text-gray-400" />
                    <span className="font-medium">Chapter {chapterNum}</span>
                  </div>
                  <div className="flex items-center">
                    {chapterGroup.length > 1 && (
                      <span className="px-2 py-1 mr-2 text-xs bg-gray-700 rounded-full">
                        {Object.keys(
                          chapterGroup.reduce((acc, ch) => {
                            acc[ch.attributes.translatedLanguage] = true;
                            return acc;
                          }, {})
                        ).map(lang => FLAGS[lang] || lang).join(' ')}
                  </span>
                    )}
                    {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              </div>
                
                {/* Danh sách các bản dịch của chapter */}
                {isExpanded && (
                  <div className="divide-y divide-gray-800">
                    {chapterGroup.map(chapter => (
                      <Link 
                        to={`/manga/${mangaId}/chapter/${chapter.id}`}
                        key={chapter.id} 
                        className="p-3 pl-8 hover:bg-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors block"
                      >
                        <div className="flex items-center mb-2 sm:mb-0">
                          <span className="mr-2 text-lg">
                            {FLAGS[chapter.attributes.translatedLanguage] || chapter.attributes.translatedLanguage}
                          </span>
                          <span className="font-medium">
                            {chapter.attributes.title || `Número${chapter.attributes.chapter}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                          <div className="flex items-center">
                            <FaRegClock className="mr-1" />
                            <span>{formatPublishTime(chapter.attributes.publishAt)}</span>
                </div>
                          
                          <div className="flex items-center">
                            <FaUser className="mr-1" />
                            <span className="max-w-[150px] truncate">{getScanlationGroupName(chapter)}</span>
                </div>
                          
                          <div className="flex items-center">
                            <FaEye className="mr-1" />
                  <span>N/A</span>
                </div>
              </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          );
        })}
        </div>
      )}
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded flex items-center ${
              currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaChevronLeft className="mr-1" /> Trang trước
          </button>
          
          <div className="text-sm">
            Trang {currentPage} / {totalPages}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded flex items-center ${
              currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Trang sau <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
      </div>
    );
  };

// Component chính
const MangaDetail = () => {
  const { mangaId } = useParams();
  const dispatch = useDispatch();
  const { manga, loading: mangaLoading, error: mangaError } = useSelector(state => state.mangadex);
  const { chapters, chaptersLoading, chaptersError } = useSelector(state => state.mangadex);
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showFullCover, setShowFullCover] = useState(false);
  const [rating, setRating] = useState(0);
  
  useEffect(() => {
    if (mangaId) {
      dispatch(resetChapters());
      dispatch(getMangaDetailAsync(mangaId));
      
      // Scroll lên đầu trang
      window.scrollTo(0, 0);
    }
  }, [dispatch, mangaId]);
  
  // Khi có thông tin manga, cập nhật tiêu đề trang
  useEffect(() => {
    if (manga && manga.attributes?.title) {
      document.title = `${getLocalizedValue(manga.attributes.title)} | Manga Corner`;
      // Nếu có rating trước đó
      setRating(Math.floor(Math.random() * 5) + 1); // Giả lập rating
    }
  }, [manga]);
  
  // Thêm log để debug
  useEffect(() => {
    console.log('Component: chapters data hiện tại:', chapters);
  }, [chapters]);
  
  // Thêm useEffect để debug
  useEffect(() => {
    if (chapters) {
      console.log('MangaDetail - chapters state:', chapters);
      console.log('MangaDetail - chapters có data?', !!chapters.data);
      console.log('MangaDetail - chapters data length:', chapters.data?.length || 0);
      
      if (chapters.data && chapters.data.length > 0) {
        console.log('MangaDetail - chapter đầu tiên:', chapters.data[0]);
      }
    }
  }, [chapters]);
  
  const getLocalizedValue = (obj, fallback = '') => {
    if (!obj) return fallback;
    
    // Thứ tự ưu tiên: vi -> en -> ja -> ko -> zh -> fallback
    const preferredLanguages = ['vi', 'en', 'ja', 'ko', 'zh'];
    
    for (const lang of preferredLanguages) {
      if (obj[lang] && obj[lang].trim()) {
        return obj[lang];
      }
    }
    
    // Nếu không tìm thấy ngôn ngữ ưu tiên, lấy giá trị đầu tiên có sẵn
    const firstAvailable = Object.values(obj).find(value => value && value.trim());
    return firstAvailable || fallback;
  };
  
  const getCoverImage = () => {
    try {
      if (!manga) return null;
      
      const relationships = manga.relationships || [];
      const cover = relationships.find(rel => rel.type === 'cover_art');
      
      if (!cover || !cover.attributes) {
        return null;
      }
      
      const fileName = cover.attributes.fileName;
      return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    } catch (error) {
      console.error('Lỗi khi lấy cover image:', error);
      return null;
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };
  
  if (mangaLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-700 h-96"></div>
            <div className="p-6 md:p-8 md:w-2/3">
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-5 bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="mt-6 flex space-x-3">
                <div className="h-10 bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 bg-gray-800 rounded-lg h-96 animate-pulse"></div>
      </div>
    );
  }
  
  if (mangaError || !manga) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto bg-red-900 border border-red-800 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Không thể tải thông tin truyện</h2>
          <p className="mb-4">{mangaError || 'Không tìm thấy dữ liệu truyện'}</p>
          <button
            onClick={() => dispatch(getMangaDetailAsync(mangaId))}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  const coverImage = getCoverImage();
  const title = getLocalizedValue(manga.attributes.title);
  const description = getLocalizedValue(manga.attributes.description);
  const hasLongDescription = description && description.length > 300;
  const truncatedDescription = hasLongDescription 
    ? `${description.slice(0, 300)}...` 
    : description;
  
  const displayDescription = isDescriptionExpanded ? description : truncatedDescription;
  
  return (
    <div className="relative">
      {/* Ảnh nền full width */}
      {coverImage && (
        <div 
          className="absolute top-0 left-0 w-full h-[500px] bg-cover bg-center bg-no-repeat opacity-30"
          style={{ 
            backgroundImage: `url(${coverImage})`,
            backgroundPosition: 'top',
            filter: 'blur(8px)',
            WebkitFilter: 'blur(8px)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900"></div>
        </div>
      )}
      
      {/* Modal xem ảnh bìa đầy đủ */}
      <Transition show={showFullCover} as={Fragment}>
        <Dialog 
          as="div" 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setShowFullCover(false)}
        >
          <div className="min-h-screen flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-90" />
            
            <div className="relative bg-transparent max-w-4xl mx-auto">
              <button 
                onClick={() => setShowFullCover(false)}
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800/50 hover:bg-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
              
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt={title}
                  className="max-h-[90vh] max-w-full object-contain"
                />
              )}
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Nội dung chính */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header với thông tin manga */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Ảnh bìa */}
              <div className="md:w-1/3 lg:w-1/4 relative">
                <div 
                  className="h-[400px] w-full bg-cover bg-center bg-no-repeat cursor-pointer transition transform hover:brightness-110"
                  style={{ 
                    backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center'
                  }}
                  onClick={() => setShowFullCover(true)}
                >
                  {!coverImage && (
                    <div className="h-full flex items-center justify-center bg-gray-700 text-gray-500">
                      <span>Không có ảnh bìa</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thông tin manga */}
              <div className="p-6 md:p-8 md:w-2/3 lg:w-3/4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
                
                <div className="flex items-center text-gray-400 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onClick={() => setRating(i + 1)}>
                        {i < rating ? (
                          <FaStar className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <FaRegStar className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="ml-2">{rating.toFixed(1)}/5</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <FaEye className="mr-1 text-blue-400" /> 
                    {Math.floor(Math.random() * 10000).toLocaleString()} lượt xem
                  </span>
                </div>
                
                <div className="space-y-2 text-gray-300 mb-6">
                  {manga.attributes.status && (
                    <div className="flex items-center">
                      <span className="text-gray-400 w-28">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        manga.attributes.status === 'completed' ? 'bg-green-900 text-green-300' : 
                        manga.attributes.status === 'ongoing' ? 'bg-blue-900 text-blue-300' : 
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {manga.attributes.status === 'completed' ? 'Hoàn thành' : 
                         manga.attributes.status === 'ongoing' ? 'Đang tiến hành' : 
                         manga.attributes.status === 'hiatus' ? 'Tạm ngưng' : 
                         manga.attributes.status || 'Không rõ'}
                      </span>
                    </div>
                  )}
                  
                  {manga.attributes.year && (
                    <div className="flex items-center">
                      <span className="text-gray-400 w-28">Xuất bản:</span>
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-yellow-500" />
                        {manga.attributes.year}
                      </span>
                    </div>
                  )}
                  
                  {manga.attributes.tags && manga.attributes.tags.length > 0 && (
                    <div className="flex">
                      <span className="text-gray-400 w-28">Thể loại:</span>
                      <div className="flex flex-wrap">
                        {manga.attributes.tags.map(tag => (
                          <span 
                            key={tag.id} 
                            className="inline-flex items-center px-2 py-1 mr-2 mb-2 rounded bg-gray-700 text-gray-300 text-xs"
                          >
                            <FaTag className="mr-1 text-purple-400" />
                            {getLocalizedValue(tag.attributes.name, 'Không có tên')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {manga.attributes.originalLanguage && (
                    <div className="flex items-center">
                      <span className="text-gray-400 w-28">Ngôn ngữ gốc:</span>
                      <span className="flex items-center">
                        <FaLanguage className="mr-2 text-green-500" />
                        {manga.attributes.originalLanguage === 'ja' ? 'Tiếng Nhật' :
                         manga.attributes.originalLanguage === 'ko' ? 'Tiếng Hàn' :
                         manga.attributes.originalLanguage === 'zh' ? 'Tiếng Trung' :
                         manga.attributes.originalLanguage === 'en' ? 'Tiếng Anh' :
                         manga.attributes.originalLanguage}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Nút hành động */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition flex items-center">
                    <FaBookmark className="mr-2" /> Đánh dấu
                  </button>
                  <Link 
                    to={`/manga/${mangaId}/chapter/${manga.firstChapterId || ''}`}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition"
                  >
                    Đọc ngay
                  </Link>
                </div>
                
                {/* Mô tả */}
                {description && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                      <FaInfoCircle className="mr-2 text-blue-400" /> Mô tả
                    </h3>
                    <div className="text-gray-300 leading-relaxed">
                      <p className="whitespace-pre-line">{displayDescription}</p>
                      
                      {hasLongDescription && (
                        <button
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="mt-2 text-blue-400 hover:text-blue-300 flex items-center transition"
                        >
                          {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                          <HiChevronDown className={`ml-1 transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Danh sách chapter */}
          <div className="mt-8">
            <ChapterList mangaId={mangaId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;