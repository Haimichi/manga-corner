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
  
  // State để lưu trữ chapter đã được phân loại
  const [vietnameseChapters, setVietnameseChapters] = useState([]);
  const [englishChapters, setEnglishChapters] = useState([]);
  
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
  
  // Phân loại chapter theo ngôn ngữ khi chapters thay đổi
  useEffect(() => {
    if (chapters && chapters.length > 0) {
      console.log("Phân loại chapters theo ngôn ngữ");
      
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
        <p className="text-center text-gray-500 py-3">
          Không có chapter {language === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}
        </p>
      );
    }
    
    return (
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div 
            key={chapter.id} 
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <a href={`/manga/${mangaId}/chapter/${chapter.id}`} className="block">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Chapter {chapter.attributes?.chapter || '?'}</span>
                  {chapter.attributes?.title && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {chapter.attributes.title}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(chapter.attributes.publishAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              {chapter.relationships && chapter.relationships.some(r => r.type === 'scanlation_group') && (
                <div className="text-xs text-gray-500 mt-1">
                  {chapter.relationships.find(r => r.type === 'scanlation_group')?.attributes?.name || 'Không rõ nhóm dịch'}
                </div>
              )}
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
            
            {/* Tab tiếng Việt và tiếng Anh */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button 
                    className={`inline-block py-2 px-4 font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400`}
                    type="button"
                  >
                    Tiếng Việt ({vietnameseChapters.length})
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-block py-2 px-4 font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:border-gray-300`}
                    type="button"
                  >
                    Tiếng Anh ({englishChapters.length})
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Hiển thị chapter tiếng Việt */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-600 dark:text-blue-400">Tiếng Việt</h3>
              {renderChapterList(vietnameseChapters, 'vi')}
            </div>
            
            {/* Hiển thị chapter tiếng Anh */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-green-600 dark:text-green-400">Tiếng Anh</h3>
              {renderChapterList(englishChapters, 'en')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail; 