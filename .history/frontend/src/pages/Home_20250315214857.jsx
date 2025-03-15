import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/manga/mangaSlice';
import { followManga, unfollowManga, getFollowedManga } from '../features/user/userSlice';
import MangaList from '../components/manga/MangaList';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import MangaCard from '../components/manga/MangaCard';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading, error } = useSelector((state) => state.manga);
  const { followedMangaIds } = useSelector((state) => state.user || { followedMangaIds: [] });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLatestManga({ limit: 10 }));
    dispatch(fetchPopularManga({ limit: 10 }));
    
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

  if (loading && !latestManga.length && !popularManga.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Truyện Mới Cập Nhật</h2>
          <Link to="/manga/latest" className="text-primary-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        {latestManga.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {latestManga.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-500">Không có truyện mới.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Truyện Phổ Biến</h2>
          <Link to="/manga/popular" className="text-primary-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        
        {popularManga.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularManga.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-500">Không có truyện phổ biến.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
