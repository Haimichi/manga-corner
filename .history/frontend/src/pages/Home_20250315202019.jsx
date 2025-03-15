import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MangaList from '../components/manga/MangaList';
import { fetchLatestManga, fetchPopularManga } from '../features/manga/mangaSlice';
import { followManga, unfollowManga } from '../features/user/userSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading, error } = useSelector((state) => state.manga);
  const { followedMangaIds } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLatestManga());
    dispatch(fetchPopularManga());
  }, [dispatch]);

  const handleFollow = async (mangaId) => {
    if (!user) {
      // Chuyển hướng đến trang đăng nhập
      return;
    }

    if (followedMangaIds.includes(mangaId)) {
      dispatch(unfollowManga(mangaId));
    } else {
      dispatch(followManga(mangaId));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Mới cập nhật</h2>
        <MangaList
          mangas={latestManga}
          loading={loading}
          error={error}
          onFollow={handleFollow}
          followedMangaIds={followedMangaIds}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Phổ biến</h2>
        <MangaList
          mangas={popularManga}
          loading={loading}
          error={error}
          onFollow={handleFollow}
          followedMangaIds={followedMangaIds}
        />
      </section>
    </div>
  );
};

export default Home;
