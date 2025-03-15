import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/manga/mangaSlice';
import { followManga, unfollowManga, getFollowedManga } from '../features/user/userSlice';
import MangaList from '../components/manga/MangaList';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading } = useSelector((state) => state.manga);
  const { followedMangaIds } = useSelector((state) => state.user);
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

  if (loading && !latestManga.length && !popularManga.length) {
    return <Loading />;
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
        <MangaList
          mangas={latestManga.slice(0, 5)}
          loading={loading}
          onFollow={handleFollow}
          followedMangaIds={followedMangaIds}
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Phổ biến</h2>
          <Link to="/popular" className="text-primary-600 hover:text-primary-800">
            Xem tất cả
          </Link>
        </div>
        <MangaList
          mangas={popularManga.slice(0, 5)}
          loading={loading}
          onFollow={handleFollow}
          followedMangaIds={followedMangaIds}
        />
      </section>
    </div>
  );
};

export default Home;
