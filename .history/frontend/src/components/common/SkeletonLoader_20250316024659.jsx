import React from 'react';

const ChapterListSkeleton = ({ count = 5 }) => {
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
};

export default ChapterListSkeleton;