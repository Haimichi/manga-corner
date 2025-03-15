import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading } = useSelector((state) => state.mangadex);
  
  // Thêm log để debug
  console.log("latestManga:", latestManga);
  console.log("popularManga:", popularManga);
  
  useEffect(() => {
    console.log("Home.jsx useEffect đang chạy");
    
    // Đảm bảo tham số đúng cho API
    dispatch(fetchLatestManga({ 
      limit: 12, 
      offset: 0,
      sort: 'updatedAt',  // Thay đổi từ latestUploadedChapter
      order: 'desc'
    }))
      .unwrap()
      .then(result => console.log("fetchLatestManga thành công:", result))
      .catch(error => console.error("fetchLatestManga lỗi:", error));
    
    dispatch(fetchPopularManga({ 
      limit: 12, 
      offset: 0 
    }))
      .unwrap()
      .then(result => console.log("fetchPopularManga thành công:", result))
      .catch(error => console.error("fetchPopularManga lỗi:", error));
  }, [dispatch]);
  
  // Kiểm tra nếu không có dữ liệu
  const hasLatestManga = Array.isArray(latestManga) && latestManga.length > 0;
  const hasPopularManga = Array.isArray(popularManga) && popularManga.length > 0;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manga Corner</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Truyện Mới Cập Nhật</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="loader">Đang tải...</div>
          </div>
        ) : !hasLatestManga ? (
          <div className="text-center text-gray-500">
            Không có truyện mới để hiển thị
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {latestManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Truyện Phổ Biến</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="loader">Đang tải...</div>
          </div>
        ) : !hasPopularManga ? (
          <div className="text-center text-gray-500">
            Không có truyện phổ biến để hiển thị
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
      
      <div className="flex justify-center mt-8">
        <Link 
          to="/manga" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Xem thêm
        </Link>
      </div>
    </div>
  );
};

export default Home;
