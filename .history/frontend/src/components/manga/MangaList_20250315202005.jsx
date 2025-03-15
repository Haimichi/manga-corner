import React from 'react';
import MangaCard from './MangaCard';
import Loading from '../common/Loading';

const MangaList = ({ mangas, loading, error, onFollow, followedMangaIds = [] }) => {
  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!mangas?.length) return <div className="text-gray-500 text-center">Không có manga nào</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {mangas.map((manga) => (
        <MangaCard
          key={manga._id}
          manga={manga}
          onFollow={onFollow}
          isFollowed={followedMangaIds.includes(manga._id)}
        />
      ))}
    </div>
  );
};

export default MangaList;
