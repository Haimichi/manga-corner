import React from 'react';

export const MangaCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-64 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const MangaDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-6 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 mb-10">
      <div className="w-full md:w-1/3 lg:w-1/4 h-96 bg-gray-300 rounded"></div>
      <div className="w-full md:w-2/3 lg:w-3/4">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default { MangaCardSkeleton, MangaDetailSkeleton };