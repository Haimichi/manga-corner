import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters, resetChapters } from '../features/mangadex/mangadexSlice';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  FaEye, FaRegClock, FaUser, FaCommentAlt, FaAngleDown, FaAngleUp, 
  FaBookmark, FaShare, FaStar, FaExclamationTriangle, FaExternalLinkAlt,
  FaRandom, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import ErrorBoundary from '../components/ErrorBoundary';
import OptimizedImage from '../components/OptimizedImage';
import ChapterList from '../components/ChapterList';

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
  
  // Thêm state để theo dõi số lần thử lại
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    if (mangaId) {
      // Reset state trước khi fetch mới
      dispatch(resetChapters());
      
      // Fetch manga detail và chapters
      dispatch(getMangaDetailAsync(mangaId));
      dispatch(fetchMangaChapters(mangaId));
      
      console.log('Component: Đã gửi request lấy manga và chapters');
    }
  }, [dispatch, mangaId]);
  
  // Retry logic: thử lại nếu không có chapters sau 2 giây
  useEffect(() => {
    if (!chaptersLoading && (!chapters?.data || chapters.data.length === 0) && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Component: Thử lại lần ${retryCount + 1} để lấy chapters`);
        dispatch(fetchMangaChapters(mangaId));
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [chapters, chaptersLoading, mangaId, dispatch, retryCount]);
  
  // Thêm log để debug
  useEffect(() => {
    console.log('Component: chapters data hiện tại:', chapters);
  }, [chapters]);
  
  // Khi có thông tin manga, cập nhật tiêu đề trang
  useEffect(() => {
    if (manga && manga.attributes?.title) {
      document.title = `${manga.attributes.title} | Manga Corner`;
    }
  }, [manga]);

  // Hiển thị loading
  if (mangaLoading) {
    return <MangaDetailSkeleton />;
  }
  
  // Hiển thị lỗi
  if (mangaError) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p className="text-gray-600 mb-6">{mangaError}</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Quay lại trang chủ
          </Link>
      </div>
    );
  }

  // Hiển thị khi không tìm thấy manga
  if (!manga) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy thông tin manga</h1>
        <p className="text-gray-600 mb-6">Manga ID: {mangaId}</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Quay lại trang chủ
          </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ErrorBoundary>
        <MangaInfo manga={manga} getLocalizedValue={getLocalizedValue} />
      </ErrorBoundary>
      
      <div className="mt-8">
        <ChapterList mangaId={mangaId} />
      </div>

      <div className="text-center">
        <Link to="/" className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
          <FaChevronLeft className="mr-2" /> Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

// Thêm hàm helper để xử lý URL ảnh
const getCoverImage = (manga) => {
  // Lấy cover art từ relationships nếu có
  const coverRelationship = manga.relationships?.find(rel => rel.type === 'cover_art');
  
  if (coverRelationship?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
  }
  
  // Nếu đã có coverUrl được xử lý trước đó
  if (manga.coverUrl) {
    return manga.coverUrl;
  }
  
  // Fallback cuối cùng
  return 'https://placehold.co/600x800/1f2937/ffffff?text=Không+có+ảnh';
};

// Thêm hàm getLocalizedValue
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

export default MangaDetail;