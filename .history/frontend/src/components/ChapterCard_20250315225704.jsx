import React from 'react';
import { Link } from 'react-router-dom';

const ChapterCard = ({ chapter, mangaId }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  const getChapterTitle = () => {
    return `Chương ${chapter.attributes.chapter || '?'}: ${chapter.attributes.title || 'Không có tiêu đề'}`;
  };
  
  // Lấy tên nhóm dịch (nếu có)
  const getScanlationGroup = () => {
    const group = chapter.relationships.find(rel => rel.type === 'scanlation_group');
    return group?.attributes?.name || 'Không rõ';
  };
  
  return (
    <div className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition">
      <Link 
        to={`/manga/${mangaId}/chapter/${chapter.id}`}
        className="block"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="font-medium mb-1 sm:mb-0">{getChapterTitle()}</div>
          
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
            <span className="mb-1 sm:mb-0 sm:mr-4">Nhóm dịch: {getScanlationGroup()}</span>
            <span>{formatDate(chapter.attributes.publishAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ChapterCard;
