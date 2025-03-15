import React from 'react';

const SkeletonLoader = ({ type = 'chapters', count = 5 }) => {
  // Nếu type là chapters, hiển thị skeleton cho danh sách chapter
  if (type === 'chapters') {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-700 px-4 py-3 animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/3 mb-3"></div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-600 rounded w-28"></div>
            <div className="h-10 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-700">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="p-4 animate-pulse">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="h-6 bg-gray-700 rounded w-20 mr-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="h-10 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Nếu type là manga, hiển thị skeleton cho thông tin manga
  if (type === 'manga') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="md:flex">
          <div className="md:w-1/4 bg-gray-700 h-64 rounded"></div>
          <div className="md:w-3/4 md:pl-6 mt-4 md:mt-0">
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Skeleton mặc định
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-12 bg-gray-700 rounded"></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;