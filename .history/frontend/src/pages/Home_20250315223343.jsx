import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestMangadex, fetchPopularMangadex } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading, error } = useSelector((state) => ({
    latestManga: state.mangadex.latestManga,
    popularManga: state.mangadex.popularManga,
    loading: {
      latest: state.mangadex.loading.latest,
      popular: state.mangadex.loading.popular
    },
    error: {
      latest: state.mangadex.error.latest,
      popular: state.mangadex.error.popular
    }
  }));

  useEffect(() => {
    dispatch(fetchLatestMangadex(12));
    dispatch(fetchPopularMangadex(12));
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Truyện Mới Cập Nhật</h2>
          <Link to="/latest" className="text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        {loading.latest ? (
          <div className="grid place-items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error.latest ? (
          <div className="bg-red-100 p-4 rounded-md text-red-800">
            <p>Có lỗi xảy ra: {error.latest}</p>
          </div>
        ) : latestManga && latestManga.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {latestManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-md text-center text-gray-500">
            Không có truyện mới.
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Truyện Phổ Biến</h2>
          <Link to="/popular" className="text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        {loading.popular ? (
          <div className="grid place-items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error.popular ? (
          <div className="bg-red-100 p-4 rounded-md text-red-800">
            <p>Có lỗi xảy ra: {error.popular}</p>
          </div>
        ) : popularManga && popularManga.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popularManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-md text-center text-gray-500">
            Không có truyện phổ biến.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
