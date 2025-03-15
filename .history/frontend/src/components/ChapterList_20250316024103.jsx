import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaEye, FaRegClock, FaUser, FaCommentAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMangaChapters, resetChapters } from '../features/mangadex/mangadexSlice';

// Mảng các cờ quốc gia cho các ngôn ngữ
const FLAGS = {
  'vi': '🇻🇳',
  'en': '🇬🇧',
};

const ChapterList = ({ mangaId }) => {
  const dispatch = useDispatch();
  const { chapters, chaptersLoading, chaptersError } = useSelector(state => state.mangadex);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    if (mangaId) {
      dispatch(resetChapters());
      dispatch(fetchMangaChapters(mangaId));
    }
  }, [dispatch, mangaId]);
  
  useEffect(() => {
    console.log('ChapterList - chapters data:', chapters);
    console.log('ChapterList - chapters data length:', chapters?.data?.length || 0);
  }, [chapters]);

  // Sửa hàm groupChaptersByNumber
  const groupChaptersByNumber = () => {
    const result = {};
    
    // Kiểm tra cấu trúc dữ liệu trước khi xử lý
    if (!chapters?.data || !Array.isArray(chapters.data)) {
      console.log('Không thể nhóm chapter vì dữ liệu không hợp lệ:', chapters);
      return {};
    }
    
    // Sử dụng chapters.data thay vì chapters
    chapters.data.forEach(chapter => {
      const chapterNum = chapter.attributes.chapter || 'N/A';
      if (!result[chapterNum]) {
        result[chapterNum] = [];
      }
      result[chapterNum].push(chapter);
    });
    
    return result;
  };

  // Nhóm chapters theo chapter number
  const groupedChapters = groupChaptersByNumber();
  
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
      if (!chapter || !chapter.relationships) return 'Unknown';
      
      const relationships = chapter.relationships || [];
      const group = relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || '@' + (group?.attributes?.username || 'Unknown');
    } catch (error) {
      console.error('Lỗi khi lấy tên nhóm dịch:', error);
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

  // Hiển thị loading
  if (chaptersLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-700 rounded-md mb-2"></div>
        ))}
      </div>
    );
  }

  // Hiển thị error
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
        <div className="mt-4 p-3 bg-yellow-950 rounded text-xs text-yellow-500">
          <p>Thông tin debug:</p>
          <p>- Có chapters: {chapters ? 'Có' : 'Không'}</p>
          <p>- Có thuộc tính data: {chapters?.data ? 'Có' : 'Không'}</p>
          <p>- Data là mảng: {chapters?.data && Array.isArray(chapters.data) ? 'Đúng' : 'Sai'}</p>
          <p>- Số lượng chapters: {chapters?.data?.length || 0}</p>
        </div>
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

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-4 py-3 flex justify-between items-center">
        <h3 className="text-white font-medium">Danh sách chapter ({chapters.data.length})</h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {sortedChapterNumbers.map(chapterNum => {
          const chapterVersions = groupedChapters[chapterNum];
          const firstChapter = chapterVersions[0];
          
          return (
            <div key={chapterNum} className="p-3 hover:bg-gray-700 transition">
              <div className="flex flex-col md:flex-row md:justify-between">
                <Link 
                  to={`/manga/${mangaId}/chapter/${firstChapter.id}`} 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Chapter {chapterNum}: {firstChapter.attributes.title || 'Không có tiêu đề'}
                </Link>
                <div className="text-gray-400 text-sm mt-1 md:mt-0">
                  {getScanlationGroupName(firstChapter)} • {formatDate(firstChapter.attributes.publishAt)}
                </div>
              </div>
              
              {/* Nếu có nhiều phiên bản của cùng 1 chapter (nhiều nhóm dịch) */}
              {chapterVersions.length > 1 && (
                <div className="mt-2 pl-4 text-sm">
                  {chapterVersions.slice(1).map(version => (
                    <div key={version.id} className="text-gray-500 mt-1">
                      <Link 
                        to={`/manga/${mangaId}/chapter/${version.id}`}
                        className="text-gray-400 hover:text-blue-300"
                      >
                        - {getScanlationGroupName(version)}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterList; 