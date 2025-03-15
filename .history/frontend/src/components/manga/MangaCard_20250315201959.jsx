import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid';

const MangaCard = ({ manga, onFollow, isFollowed }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/manga/${manga._id}`}>
        <div className="relative h-64">
          <img
            src={manga.coverImage}
            alt={manga.title.vi || manga.title.en}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {manga.title.vi || manga.title.en}
            </h3>
            <p className="text-gray-300 text-sm">
              Chapter mới nhất: {manga.lastChapter}
            </p>
          </div>
        </div>
      </Link>
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
