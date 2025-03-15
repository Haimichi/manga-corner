import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters } from '../features/mangadex/mangadexSlice';
import { getMangaDetails } from '../services/mangadexApi';
import ChapterCard from '../components/ChapterCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MangaDetail = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { manga, chapters, loading, error } = useSelector((state) => state.mangadex);
  const [localLoading, setLocalLoading] = useState(true);
  
  // State để lưu trữ chapter đã được phân loại
  const [vietnameseChapters, setVietnameseChapters] = useState([]);
  const [englishChapters, setEnglishChapters] = useState([]);
  
  // Thêm state để quản lý tab đang active
  const [activeTab, setActiveTab] = useState('vi');
  
  // Lấy danh sách chapter và thông tin về phân trang
  const mangaChapters = chapters[mangaId]?.data || [];
  const chapterPagination = chapters[mangaId]?.pagination || { hasMore: false };
  
  // Thêm hình ảnh cờ
  const flagImages = {
    vi: '/images/flags/vietnam.png',
    en: '/images/flags/uk.png'
  };
  
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
    } else {
      setVietnameseChapters([]);
      setEnglishChapters([]);
    }
  }, [chapters]);
  
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
  
  // Hàm render danh sách chapter theo ngôn ngữ
  const renderChapterList = (chapters, language) => {
    if (!chapters || chapters.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Không có chapter {language === 'vi' ? 'tiếng Việt' : 'tiếng Anh'} cho manga này
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {chapters.map((chapter) => {
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
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
            >
              <a href={`/manga/${mangaId}/chapter/${chapter.id}`} className="block">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0 flex items-center">
                    <span className="text-lg font-medium">
                      Chapter {chapter.attributes?.chapter || '?'}
                    </span>
                    {chapter.attributes?.title && (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        - {chapter.attributes.title}
                      </span>
                    )}
                    <img 
                      src={flagImages[language]} 
                      alt={language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'} 
                      className="ml-2 w-5 h-auto"
                      title={language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
                    />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {publishDate}
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {groupName}
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
      <ToastContainer position="bottom-right" />
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
            
            {/* Tab Navigation với cờ */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button 
                    className={`inline-block py-2 px-4 font-medium border-b-2 ${activeTab === 'vi' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('vi')}
                    type="button"
                  >
                    <span className="mr-2 text-xl">🇻🇳</span> 
                    Tiếng Việt ({vietnameseChapters.length})
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-block py-2 px-4 font-medium border-b-2 ${activeTab === 'en' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('en')}
                    type="button"
                  >
                    <span className="mr-2 text-xl">🇬🇧</span>
                    Tiếng Anh ({englishChapters.length})
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Loading indicator khi đang tải chapter */}
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Đang tải chapter...</p>
              </div>
            )}
            
            {/* Tab Content */}
            {!loading && (
              <div>
                {activeTab === 'vi' && (
                  <>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <span className="mr-2 text-xl">🇻🇳</span>
                      <span className="text-blue-600 dark:text-blue-400">Chapter Tiếng Việt</span>
                    </h3>
                    {renderChapterList(vietnameseChapters, 'vi')}
                  </>
                )}
                
                {activeTab === 'en' && (
                  <>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <span className="mr-2 text-xl">🇬🇧</span>
                      <span className="text-green-600 dark:text-green-400">Chapter Tiếng Anh</span>
                    </h3>
                    {renderChapterList(englishChapters, 'en')}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail; 