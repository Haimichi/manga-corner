import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestMangadex, fetchPopularMangadex } from '../features/mangadex/mangadexSlice';
import { followManga, unfollowManga, getFollowedManga } from '../features/user/userSlice';
import MangaList from '../components/manga/MangaList';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
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
  const { followedMangaIds } = useSelector((state) => state.user || { followedMangaIds: [] });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLatestMangadex(12));
    dispatch(fetchPopularMangadex(12));
    
    if (user) {
      dispatch(getFollowedManga());
    }
  }, [dispatch, user]);

  const handleFollow = async (mangaId) => {
    if (!user) {
      toast('Vui lòng đăng nhập để theo dõi manga');
      return;
    }

    if (followedMangaIds.includes(mangaId)) {
      dispatch(unfollowManga(mangaId));
      toast.success('Đã bỏ theo dõi manga');
    } else {
      dispatch(followManga(mangaId));
      toast.success('Đã theo dõi manga');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4">MangaCorner</h1>
        <p className="text-xl mb-6">Đọc manga yêu thích của bạn miễn phí</p>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/manga/latest" 
            className="bg-white text-primary-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100"
          >
            Mới cập nhật
          </Link>
          <Link 
            to="/manga/popular" 
            className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-md font-medium hover:bg-white hover:text-primary-600"
          >
            Phổ biến
          </Link>
        </div>
      </div>

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
