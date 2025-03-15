import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaEye, FaRegClock, FaUser, FaCommentAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import ChapterList from '../components/ChapterList';

// Mảng các cờ quốc gia cho các ngôn ngữ
const FLAGS = {
  'vi': '🇻🇳',
  'en': '🇬🇧',
};

const MangaDetail = () => {
  const { mangaId } = useParams();
  const dispatch = useDispatch();
  const [localLoading, setLocalLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vi');
  const [vietnameseChapters, setVietnameseChapters] = useState([]);
  const [englishChapters, setEnglishChapters] = useState([]);
  const [error, setError] = useState(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 10;
  
  // Lấy dữ liệu từ Redux store
  const { manga, chapters, loading } = useSelector((state) => state.mangadex);
  const [expandedChapters, setExpandedChapters] = useState({});
  
  // Hàm để lấy giá trị đa ngôn ngữ an toàn
  const getLocalizedValue = (objOrString, defaultValue = '') => {
    if (!objOrString) return defaultValue;
    if (typeof objOrString === 'string') return objOrString;
    if (typeof objOrString === 'object') {
      return objOrString.vi || objOrString.en || 
        (Object.keys(objOrString).length > 0 ? objOrString[Object.keys(objOrString)[0]] : defaultValue);
    }
    return defaultValue;
  };

  useEffect(() => {
    if (mangaId) {
      console.log("Đang tải thông tin cho manga với ID:", mangaId);
      setLocalLoading(true);
      setError(null);
      
      // Tải thông tin manga
      dispatch(getMangaDetailAsync(mangaId))
        .unwrap()
        .then((response) => {
          console.log("Đã nhận được dữ liệu manga:", response);
          
          // Tải chapters sau khi lấy thông tin manga thành công
          return dispatch(fetchMangaChapters(mangaId)).unwrap();
        })
        .then((chaptersResponse) => {
          console.log("Đã nhận được dữ liệu chapters:", chaptersResponse);
        })
        .catch((error) => {
          console.error("Lỗi khi tải manga:", error);
          setError(error.message || "Không thể tải thông tin manga");
        })
        .finally(() => {
          setLocalLoading(false);
        });
    }
  }, [dispatch, mangaId]);

  // Sửa hàm groupChaptersByNumber để kiểm tra kỹ hơn
  const groupChaptersByNumber = (chapters) => {
    const grouped = {};
    
    // Kiểm tra chapters có phải là mảng hay không
    if (!chapters || !Array.isArray(chapters)) {
      console.log('Chapters không phải mảng:', chapters);
      return grouped;
    }
    
    chapters.forEach(chapter => {
      try {
        const chapterNum = chapter.attributes.chapter || 'unknown';
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

  // Thêm kiểm tra trước khi gọi groupChaptersByNumber
  const groupedChapters = groupChaptersByNumber(Array.isArray(chapters) ? chapters : []);
  
  // Sắp xếp các số chapter theo thứ tự giảm dần
  const sortedChapterNumbers = Object.keys(groupedChapters).sort((a, b) => {
    // Xử lý trường hợp 'unknown' hoặc giá trị không phải số
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return parseFloat(b) - parseFloat(a);
  });

  // Hàm chuyển đổi thời gian
  const formatPublishTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      return 'N/A';
    }
  };

  // Hàm lấy tên nhóm dịch
  const getScanlationGroupName = (chapter) => {
    try {
      const relationships = chapter.relationships || [];
      const group = relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || '@' + (group?.attributes?.username || 'Unknown');
    } catch (error) {
      return 'Unknown Group';
    }
  };

  // Hàm toggle mở rộng chapter
  const toggleChapterExpand = (chapterNum) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  const renderChapterList = () => {
    const currentChapters = vietnameseChapters.length > 0 ? vietnameseChapters : englishChapters;

    if (currentChapters.length === 0) {
      return (
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg p-8 text-center my-4">
          <p className="text-gray-300 text-lg">
            Không có chapter {activeTab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'} cho manga này
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-0.5 my-4">
        {currentChapters.map((chapter) => {
          const scanlationGroup = chapter.relationships?.find((r) => r.type === 'scanlation_group');
          const groupName = scanlationGroup?.attributes?.name || 'Không rõ nhóm dịch';

          const uploader = chapter.relationships?.find((r) => r.type === 'user');
          const uploaderName = uploader?.attributes?.username || 'Ẩn danh';

          const publishDate = new Date(chapter.attributes.publishAt);
          const now = new Date();
          const diffTime = Math.abs(now - publishDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

          let timeAgo;
          if (diffDays > 30) {
            const diffMonths = Math.floor(diffDays / 30);
            timeAgo = `${diffMonths} tháng trước`;
          } else if (diffDays > 0) {
            timeAgo = `${diffDays} ngày trước`;
          } else {
            timeAgo = `${diffHours} giờ trước`;
          }

          const languageFlag =
            chapter.attributes.translatedLanguage === 'vi'
              ? '🇻🇳'
              : chapter.attributes.translatedLanguage === 'en'
              ? '🇬🇧'
              : '🌐';

          const chapterNumber = chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : 'Oneshot';
          const chapterTitle = chapter.attributes.title || chapterNumber;

          return (
            <div
              key={chapter.id}
              className="bg-gray-800 hover:bg-gray-700 transition-colors py-3 px-4 rounded flex flex-col md:flex-row items-start md:items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="text-gray-400 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="inline-flex items-center mr-2">
                    <span className="mr-1">{languageFlag}</span>
                    <a
                      href={`/manga/${mangaId}/chapter/${chapter.id}`}
                      className="text-white hover:text-blue-400 font-medium truncate"
                    >
                      {chapterTitle}
                    </a>
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-400 mt-1 md:mt-0">
                  <div className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="truncate">{groupName}</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-sm mt-2 md:mt-0">
                <div className="flex items-center text-gray-400 mb-1 md:mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{timeAgo}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-400 hover:underline">{uploaderName}</span>
                </div>
                <div className="flex items-center text-gray-400 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>N/A</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Logic render chính của component
  if (localLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Đang tải thông tin manga...</p>
          <p className="mt-2 text-gray-500 text-sm">ID: {mangaId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            ID manga: {mangaId}
          </p>
          <Link 
            to="/" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin manga</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manga này có thể không tồn tại hoặc đã bị xóa.
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            ID manga: {mangaId}
          </p>
          <Link 
            to="/" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const title = getLocalizedValue(manga.attributes?.title, 'Không tên');
  const description = getLocalizedValue(manga.attributes?.description, 'Không có tóm tắt');
  const status = manga.attributes?.status || 'unknown';
  const coverImage = manga.attributes?.coverImage || '';
  const authors = manga.attributes?.authors?.map((author) => author.attributes?.name) || [];

  const statusMap = {
    ongoing: 'Đang tiến hành',
    completed: 'Hoàn thành',
    hiatus: 'Tạm ngừng',
    cancelled: 'Đã hủy',
    unknown: 'Không xác định',
  };

  return (
    <div>
      {/* Hero section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }}></div>
        <div className="container mx-auto h-full flex items-end px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end pb-6 md:pb-8 md:space-x-6">
            <div className="w-32 md:w-48 h-auto -mt-16 md:-mt-32 rounded-lg shadow-xl overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800">
              <img src={coverImage} alt={title} className="w-full h-auto object-cover" />
            </div>
            <div className="mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h1>
              <div className="flex flex-wrap items-center mb-1">
                {authors.map((author, index) => (
                  <span key={index} className="text-gray-200 mr-2">
                    {author}
                    {index < authors.length - 1 ? ',' : ''}
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
                {manga.attributes?.tags
                  ?.filter((tag) => tag.type === 'tag')
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium mr-2 mb-2"
                    >
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
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                Thông tin
              </h3>
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
                    {authors.length > 0 ? (
                      authors.map((author, index) => (
                        <div key={index} className="text-gray-600 dark:text-gray-400">
                          {author}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-600 dark:text-gray-400">Không rõ tác giả</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                Tóm tắt
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Danh sách chapter
              </h2>
              <ChapterList chapters={chapters} mangaId={mangaId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;