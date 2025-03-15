import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaEye, FaRegClock, FaUser, FaCommentAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Mảng các cờ quốc gia cho các ngôn ngữ
const FLAGS = {
  'vi': '🇻🇳',
  'en': '🇬🇧',
};

const ChapterList = ({ chapters = [], mangaId }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  // Nhóm chapters theo số chapter
  const groupChaptersByNumber = (chapters) => {
    const grouped = {};
    
    if (!chapters) return grouped;
    
    chapters.forEach(chapter => {
      const chapterNum = chapter.attributes.chapter || 'unknown';
      if (!grouped[chapterNum]) {
        grouped[chapterNum] = [];
      }
      grouped[chapterNum].push(chapter);
    });
    
    return grouped;
  };

  const groupedChapters = groupChaptersByNumber(chapters);
  
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
  
  useEffect(() => {
    console.log('Chapters data trong component:', chapters);
    // Kiểm tra cấu trúc dữ liệu
    if (chapters) {
      console.log('Kiểu dữ liệu:', typeof chapters);
      console.log('Có thuộc tính data?', 'data' in chapters);
      console.log('Data có phải mảng?', Array.isArray(chapters.data));
      console.log('Số lượng chapter:', chapters.data?.length || 0);
    }
  }, [chapters]);

  // Xử lý hiển thị khi không có chapter
  if (!chapters || !chapters.data || !Array.isArray(chapters.data) || chapters.data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
        <div className="flex items-center text-gray-700 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Không có chapter nào cho truyện này</span>
        </div>
        <p className="text-sm text-gray-600">Truyện có thể chưa được cập nhật hoặc không có bản dịch tiếng Việt/Anh.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-800 text-white font-bold text-xl flex justify-between items-center">
        <div>Danh sách chapter</div>
        <div className="text-gray-300 text-base">
          Ch. {sortedChapterNumbers[sortedChapterNumbers.length - 1] !== 'unknown' ? 
               sortedChapterNumbers[sortedChapterNumbers.length - 1] : '?'} - {sortedChapterNumbers[0] !== 'unknown' ? 
               sortedChapterNumbers[0] : '?'}
        </div>
      </div>
      
      <div className="divide-y divide-gray-700">
        {sortedChapterNumbers.map(chapterNum => {
          const chapterGroup = groupedChapters[chapterNum];
          const isExpanded = expandedChapters[chapterNum] !== false; // Mặc định mở
          
          return (
            <div key={chapterNum} className="bg-gray-900 border-gray-800">
              {/* Header của nhóm chapter */}
              <div 
                className="p-4 bg-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                onClick={() => toggleChapterExpand(chapterNum)}
              >
                <div className="flex items-center">
                  <FaEye className="mr-2 text-gray-400" />
                  <span className="font-medium">Chapter {chapterNum}</span>
                </div>
                <div className="flex items-center">
                  {chapterGroup.length > 1 && (
                    <span className="px-2 py-1 mr-2 text-xs bg-gray-700 rounded-full text-white">
                      {Object.keys(
                        chapterGroup.reduce((acc, ch) => {
                          const lang = ch.attributes.translatedLanguage;
                          acc[lang] = true;
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
                      className="p-4 pl-8 hover:bg-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between block"
                    >
                      <div className="flex items-center mb-2 sm:mb-0">
                        <span className="mr-2">
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
                          <span>{getScanlationGroupName(chapter)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FaEye className="mr-1" />
                          <span>N/A</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FaCommentAlt className="mr-1" />
                          <span>{chapter.attributes.comments || '0'}</span>
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
    </div>
  );
};

export default ChapterList; 