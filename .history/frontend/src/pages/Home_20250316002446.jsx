import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading } = useSelector((state) => state.mangadex);
  const [activeTab, setActiveTab] = useState('latest');
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Thêm định nghĩa featuredGenres
  const featuredGenres = [
    { id: 'action', name: 'Hành động' },
    { id: 'romance', name: 'Tình cảm' },
    { id: 'fantasy', name: 'Giả tưởng' },
    { id: 'comedy', name: 'Hài hước' },
    { id: 'drama', name: 'Kịch tính' },
    { id: 'horror', name: 'Kinh dị' }
  ];
  
  useEffect(() => {
    // Tải cả hai loại manga
    dispatch(fetchLatestManga({ 
      limit: 18, 
      offset: 0,
      sort: 'updatedAt',
      order: 'desc'
    }));
    
    dispatch(fetchPopularManga({ 
      limit: 18, 
      offset: 0 
    }));
  }, [dispatch]);
  
  // Timer tự động chuyển slide
  useEffect(() => {
    const timer = setInterval(() => {
      if (popularManga && popularManga.length > 0) {
        setActiveSlide((prev) => (prev + 1) % Math.min(6, popularManga.length));
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [popularManga]);
  
  // Kiểm tra nếu không có dữ liệu
  const hasLatestManga = Array.isArray(latestManga) && latestManga.length > 0;
  const hasPopularManga = Array.isArray(popularManga) && popularManga.length > 0;
  
  // Hàm lấy ảnh bìa cho slide
  const getHighResolutionCover = (manga) => {
    try {
      if (!manga || !manga.relationships) return '/images/default-cover.jpg';
      
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return '/images/default-cover.jpg';
      }
      
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg`;
    } catch (error) {
      return '/images/default-cover.jpg';
    }
  };
  
  // Hàm lấy tiêu đề an toàn
  const getTitle = (manga) => {
    try {
      if (!manga || !manga.attributes || !manga.attributes.title) return 'Không có tiêu đề';
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      return 'Không có tiêu đề';
    }
  };
  
  // Hàm lấy mô tả an toàn
  const getDescription = (manga) => {
    try {
      if (!manga || !manga.attributes || !manga.attributes.description) return '';
      
      const { description } = manga.attributes;
      const desc = description.vi || description.en || Object.values(description)[0] || '';
      
      // Giới hạn mô tả ngắn gọn
      return desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
    } catch (error) {
      return '';
    }
  };
  
  // Render carousel
  const renderCarousel = () => {
    if (loading || !hasPopularManga) {
      return (
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 relative h-96 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    
    // Chỉ lấy 6 manga đầu tiên cho carousel
    const featuredManga = popularManga.slice(0, 6);
    
    return (
      <div className="relative h-[600px] md:h-[650px] lg:h-[700px]">
        {/* Slides */}
        {featuredManga.map((manga, index) => (
          <div 
            key={manga.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background image with gradient overlay */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ 
              backgroundImage: `url(${getHighResolutionCover(manga)})` 
            }}>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800/80 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-8 flex items-center">
                <div className="w-full lg:w-1/2 text-white">
                  <Link to={`/manga/${manga.id}`}>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 hover:text-blue-400 transition">
                      {getTitle(manga)}
                    </h2>
                  </Link>
                  <p className="text-base md:text-xl mb-8 text-gray-300">
                    {getDescription(manga)}
                  </p>
                  <Link 
                    to={`/manga/${manga.id}`}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md inline-flex items-center transition text-lg"
                  >
                    Xem chi tiết
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Điều hướng */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {featuredManga.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeSlide 
                  ? 'bg-white w-8' 
                  : 'bg-gray-400 bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Nút điều hướng trái phải */}
        <button 
          onClick={() => setActiveSlide((prev) => (prev - 1 + featuredManga.length) % featuredManga.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white flex items-center justify-center hover:bg-opacity-50 focus:outline-none z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => setActiveSlide((prev) => (prev + 1) % featuredManga.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white flex items-center justify-center hover:bg-opacity-50 focus:outline-none z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Slide carousel - loại bỏ container để chiếm toàn màn hình */}
      {renderCarousel()}
      
      {/* Nội dung bên dưới carousel */}
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        {/* Thể loại nổi bật */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Thể loại nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredGenres.map(genre => (
              <Link
                key={genre.id}
                to={`/genres/${genre.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 text-center transition duration-200"
              >
                <div className="text-blue-600 dark:text-blue-400 font-medium">{genre.name}</div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Nội dung chính */}
        <div>
          {/* Tab điều hướng */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            <button
              className={`py-3 px-6 font-medium text-lg border-b-2 transition ${
                activeTab === 'latest'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('latest')}
            >
              Mới cập nhật
            </button>
            <button
              className={`py-3 px-6 font-medium text-lg border-b-2 transition ${
                activeTab === 'popular'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('popular')}
            >
              Phổ biến
            </button>
          </div>
          
          {/* Hiển thị manga dựa trên tab đang active */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="pb-[140%]"></div>
                  </div>
                  <div className="mt-3 bg-gray-200 dark:bg-gray-700 h-5 rounded-md"></div>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-4 w-2/3 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : activeTab === 'latest' ? (
            !hasLatestManga ? (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  Không có truyện mới để hiển thị
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {latestManga.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              </>
            )
          ) : (
            !hasPopularManga ? (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  Không có truyện phổ biến để hiển thị
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {popularManga.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              </>
            )
          )}
          
          {/* Nút xem thêm */}
          <div className="flex justify-center mt-12">
            <Link 
              to={`/manga/${activeTab === 'latest' ? 'latest' : 'popular'}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Xem thêm {activeTab === 'latest' ? 'truyện mới' : 'truyện phổ biến'}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Banner quảng cáo ứng dụng */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Tải ứng dụng Manga Corner
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Trải nghiệm đọc manga tốt hơn trên ứng dụng di động của chúng tôi.
                Tải xuống miễn phí ngay hôm nay!
              </p>
              <div className="flex space-x-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5,3C19.432,3,21,4.568,21,6.5v11c0,1.932-1.568,3.5-3.5,3.5h-11C4.568,21,3,19.432,3,17.5v-11C3,4.568,4.568,3,6.5,3H17.5z M12.7437,9.4362L17.5437,4.6362C16.7859,4.2333,15.9087,4,15,4H9C8.0913,4,7.2141,4.2333,6.4563,4.6362L11.2563,9.4362C11.6467,9.8267,12.3533,9.8267,12.7437,9.4362Z" />
                  </svg>
                  <div>
                    <div className="text-xs">Tải về trên</div>
                    <div className="text-md font-medium">App Store</div>
                  </div>
                </button>
                <a href="#" className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.9236,8.3378C17.1156,7.5558,16.0386,7.1178,14.9606,7.1178H9.0396C7.9616,7.1178,6.8846,7.5558,6.0766,8.3378L3.5326,10.8268C2.8196,11.5198,2.8196,12.6478,3.5326,13.3408L6.0766,15.8298C6.8846,16.6118,7.9616,17.0498,9.0396,17.0498H14.9606C16.0386,17.0498,17.1156,16.6118,17.9236,15.8298L20.4676,13.3408C21.1806,12.6478,21.1806,11.5198,20.4676,10.8268L17.9236,8.3378ZM10.0646,14.2258L5.8446,10.0058C5.6586,9.8198,5.6586,9.5158,5.8446,9.3298L6.2646,8.9098C6.4506,8.7238,6.7546,8.7238,6.9406,8.9098L11.1606,13.1298C11.3466,13.3158,11.3466,13.6198,11.1606,13.8058L10.7406,14.2258C10.5546,14.4118,10.2506,14.4118,10.0646,14.2258Z" />
                  </svg>
                  <div>
                    <div className="text-xs">Tải về trên</div>
                    <div className="text-md font-medium">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-blue-500 rounded-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-indigo-500 rounded-xl"></div>
                <div className="relative bg-white dark:bg-gray-700 p-1 rounded-xl shadow-xl z-10">
                  <img 
                    src="/images/app-preview.png" 
                    alt="Manga Corner App" 
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/350x600/3B82F6/FFFFFF?text=Manga+Corner+App"; 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
