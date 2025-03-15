import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, pagination, loading } = useSelector(state => state.mangadex);
  
  useEffect(() => {
    // Tải manga khi component mount
    dispatch(fetchLatestManga({ page: 1 }));
    dispatch(fetchPopularManga({ page: 1 }));
  }, [dispatch]);

  const handleLoadMoreLatest = () => {
    if (pagination.latest.hasMore && !loading) {
      dispatch(fetchLatestManga({ page: pagination.latest.page + 1 }));
    }
  };

  const handleLoadMorePopular = () => {
    if (pagination.popular.hasMore && !loading) {
      dispatch(fetchPopularManga({ page: pagination.popular.page + 1 }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manga Corner</h1>
      
      {/* Manga mới cập nhật */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Truyện Mới Cập Nhật</h2>
        
        {latestManga.length === 0 && loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {latestManga.map(manga => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
            
            {pagination.latest.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMoreLatest}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Manga phổ biến */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Truyện Phổ Biến</h2>
        
        {popularManga.length === 0 && loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularManga.map(manga => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
            
            {pagination.popular.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMorePopular}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
