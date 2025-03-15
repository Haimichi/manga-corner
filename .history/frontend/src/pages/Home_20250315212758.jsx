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
    dispatch(fetchLatestManga());
    dispatch(fetchPopularManga());
    
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Đã xảy ra lỗi: {error}</p>
        <p>Vui lòng thử lại sau.</p>
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
            to="/latest" 
            className="bg-white text-primary-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100"
          >
            Mới cập nhật
          </Link>
          <Link 
            to="/popular" 
            className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-md font-medium hover:bg-white hover:text-primary-600"
          >
            Phổ biến
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mới cập nhật</h2>
          <Link to="/latest" className="text-primary-600 hover:text-primary-800">
            Xem tất cả
          </Link>
        </div>
        {latestManga?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {latestManga.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu manga mới</p>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Phổ biến</h2>
          <Link to="/popular" className="text-primary-600 hover:text-primary-800">
            Xem tất cả
          </Link>
        </div>
        {popularManga?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularManga.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu manga phổ biến</p>
        )}
      </section>
    </div>
  );
};

export default Home;
