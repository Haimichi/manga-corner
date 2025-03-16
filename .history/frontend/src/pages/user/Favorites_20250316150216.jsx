import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFavorites } from '../../features/manga/mangaSlice';

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, loading, error } = useSelector(state => state.manga);
  
  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
        <p className="text-center mt-2">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Truyện yêu thích</h1>
      
      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {favorites.map(manga => (
            <div key={manga._id} className="bg-white shadow rounded-lg overflow-hidden">
              <Link to={`/manga/${manga._id}`}>
                <img 
                  src={manga.coverImage || '/images/no-image.png'} 
                  alt={manga.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <h2 className="font-semibold text-sm truncate">{manga.title}</h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Bạn chưa có truyện yêu thích nào.</p>
      )}
    </div>
  );
};

export default Favorites; 