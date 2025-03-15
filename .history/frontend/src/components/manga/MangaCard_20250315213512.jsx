import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';

const MangaCard = ({ manga, onFollow, isFollowed }) => {
  // Ưu tiên hiển thị tiếng Việt
  const title = manga.title?.vi || manga.title?.en || 'Không có tiêu đề';

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Link to={`/manga/${manga._id}`}>
        <div className="relative h-64">
          <img
            src={manga.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-semibold truncate">{title}</h3>
            <p className="text-gray-300 text-sm">
              {manga.lastChapter ? `Chapter ${manga.lastChapter}` : 'Chưa có chapter'}
            </p>
          </div>
        </div>
      </Link>
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {manga.genres?.slice(0, 3).map((genre, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {manga.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
          <button
            onClick={() => onFollow(manga._id)}
            className="text-gray-500 hover:text-primary-500"
          >
            {isFollowed ? (
              <HeartSolidIcon className="h-6 w-6 text-primary-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MangaCard;
