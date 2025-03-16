import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';

function Home() {
  const dispatch = useDispatch();
  const { latest: latestManga, popularManga, loading } = useSelector((state) => state.mangadex);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSection, setActiveSection] = useState('latest');

  // Thêm dữ liệu mẫu cho tin tức và bảng xếp hạng
  const newsData = [
    {
      id: 1,
      title: 'Ra mắt manga mới: Dragon Slayer Academy',
      image: 'https://source.unsplash.com/random/300x200?anime&sig=1',
      date: '15/06/2023',
      excerpt: 'Series manga mới từ tác giả của One Piece đã chính thức ra mắt vào tuần này...'
    },
    {
      id: 2,
      title: 'Anime adaptation cho "The Dark Mage Returns After 4000 Years"',
      image: 'https://source.unsplash.com/random/300x200?anime&sig=2',
      date: '10/06/2023',
      excerpt: 'Studio MAPPA đã thông báo sẽ chuyển thể manga nổi tiếng thành anime vào năm 2024...'
    },
    {
      id: 3,
      title: 'Top 10 manga được yêu thích nhất quý 2/2023',
      image: 'https://source.unsplash.com/random/300x200?anime&sig=3',
      date: '05/06/2023',
      excerpt: 'Danh sách 10 manga được độc giả bình chọn nhiều nhất trong quý vừa qua...'
    }
  ];

  const topRankings = [
    {
      id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
      title: 'One Piece',
      cover: 'https://source.unsplash.com/random/100x150?manga&sig=1',
      rating: 4.9,
      views: '1.2M',
      trend: 'up'
    },
    {
      id: 'd86cf65b-5f6c-437d-a0af-19a31f94ec55',
      title: 'Jujutsu Kaisen',
      cover: 'https://source.unsplash.com/random/100x150?manga&sig=2',
      rating: 4.8,
      views: '987K',
      trend: 'up'
    },
    {
      id: '0aea9f43-b85a-4378-bad0-39f5075cf2d2',
      title: 'Solo Leveling',
      cover: 'https://source.unsplash.com/random/100x150?manga&sig=3',
      rating: 4.7,
      views: '842K',
      trend: 'down'
    },
    {
      id: 'a5ead0e3-9a05-4c8c-86c5-c6a850ab0163',
      title: 'Chainsaw Man',
      cover: 'https://source.unsplash.com/random/100x150?manga&sig=4',
      rating: 4.6,
      views: '756K',
      trend: 'up'
    },
    {
      id: '4299c8c3-a3e7-44dd-9a76-f0f0ecbe428d',
      title: 'My Hero Academia',
      cover: 'https://source.unsplash.com/random/100x150?manga&sig=5',
      rating: 4.5,
      views: '701K',
      trend: 'same'
    }
  ];

  const fetchMangaData = useCallback(async () => {
    dispatch(fetchLatestManga({ limit: 18, page: 1 }));
    dispatch(fetchPopularManga({ limit: 18, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    fetchMangaData();
  }, [fetchMangaData]);

  // Tự động chuyển slide
  useEffect(() => {
    if (!popularManga || popularManga.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % Math.min(popularManga.length, 5));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [popularManga]);

  // Lấy hình ảnh bìa manga
  const getCoverImage = (manga) => {
    try {
      if (!manga || !manga.relationships) return '/images/no-cover.jpg';
      
      const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
      if (coverRel?.attributes?.fileName) {
        return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}`;
      }
      
      return '/images/no-cover.jpg';
    } catch (error) {
      return '/images/no-cover.jpg';
    }
  };
  
  // Lấy tiêu đề manga
  const getTitle = (manga) => {
    try {
      if (!manga?.attributes?.title) return 'Không có tiêu đề';
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      return 'Không có tiêu đề';
    }
  };

  // Lấy mô tả manga
  const getDescription = (manga) => {
    try {
      if (!manga?.attributes?.description) return '';
      
      const { description } = manga.attributes;
      const desc = description.vi || description.en || Object.values(description)[0] || '';
      
      return desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Slider */}
      {popularManga && popularManga.length > 0 && (
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 overflow-hidden h-[600px]">
          {/* Slider background */}
          {popularManga.slice(0, 5).map((manga, index) => (
            <div 
              key={manga.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black opacity-60"></div>
              <img 
                src={getCoverImage(manga)}
                alt={getTitle(manga)}
                className="w-full h-full object-cover object-center opacity-40"
              />
            </div>
          ))}

          {/* Content container */}
          <div className="container mx-auto px-4 h-full relative z-10">
            <div className="flex flex-col md:flex-row h-full items-center">
              {/* Left content */}
              <div className="w-full md:w-1/2 py-12 md:py-0">
                {popularManga.slice(0, 5).map((manga, index) => (
                  <div 
                    key={manga.id} 
                    className={`transition-all duration-700 ${
                      index === activeSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 absolute transform -translate-y-8'
                    }`}
                  >
                    {index === activeSlide && (
                      <>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                          {getTitle(manga)}
                        </h1>
                        <p className="text-xl text-gray-200 mb-8 max-w-lg">
                          {getDescription(manga)}
                        </p>
                        <div className="flex space-x-4">
                          <Link 
                            to={`/manga/${manga.id}`}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 inline-flex items-center"
                          >
                            Đọc ngay
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </Link>
                          <button className="px-6 py-3 bg-gray-800 bg-opacity-60 hover:bg-opacity-80 text-white font-semibold rounded-lg transition-all duration-200">
                            Thêm vào thư viện
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Right content - Cover image */}
              <div className="hidden md:block w-1/2 h-full relative">
                {popularManga.slice(0, 5).map((manga, index) => (
                  <div 
                    key={manga.id}
                    className={`absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ${
                      index === activeSlide 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="w-64 md:w-80 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src={getCoverImage(manga)}
                        alt={getTitle(manga)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slider dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {popularManga.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === activeSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Main content */}
          <div className="w-full md:w-2/3">
            {/* Navigation Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    activeSection === 'latest'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveSection('latest')}
                >
                  Mới cập nhật
                </button>
                <button
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    activeSection === 'popular'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveSection('popular')}
                >
                  Phổ biến
                </button>
                <button
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    activeSection === 'completed'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveSection('completed')}
                >
                  Đã hoàn thành
                </button>
              </div>
            </div>

            {/* Manga Grid */}
            <div className={activeSection === 'latest' ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Truyện mới cập nhật</h2>
                <Link to="/manga/latest" className="text-primary-600 hover:text-primary-700 font-medium">
                  Xem tất cả
                </Link>
              </div>
              
              {Array.isArray(latestManga) && latestManga.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {latestManga.slice(0, 12).map(manga => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <p className="text-gray-600">Không có truyện mới để hiển thị</p>
                </div>
              )}
            </div>

            <div className={activeSection === 'popular' ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Truyện phổ biến</h2>
                <Link to="/manga/popular" className="text-primary-600 hover:text-primary-700 font-medium">
                  Xem tất cả
                </Link>
              </div>
              
              {Array.isArray(popularManga) && popularManga.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {popularManga.slice(0, 12).map(manga => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <p className="text-gray-600">Không có truyện phổ biến để hiển thị</p>
                </div>
              )}
            </div>

            <div className={activeSection === 'completed' ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Truyện đã hoàn thành</h2>
                <Link to="/manga/completed" className="text-primary-600 hover:text-primary-700 font-medium">
                  Xem tất cả
                </Link>
              </div>
              
              {Array.isArray(popularManga) && popularManga.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {popularManga.filter(manga => manga.attributes?.status === 'completed').slice(0, 12).map(manga => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <p className="text-gray-600">Không có truyện hoàn thành để hiển thị</p>
                </div>
              )}
            </div>

            {/* Genres Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Khám phá theo thể loại</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {['Hành động', 'Phiêu lưu', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-fi', 'Slice of Life', 'Sports', 'Supernatural', 'Mystery'].map((genre, index) => (
                  <Link 
                    key={index}
                    to={`/manga/genre/${genre}`}
                    className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-800">{genre}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Sidebar */}
          <div className="w-full md:w-1/3">
            {/* Top Rankings */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Bảng xếp hạng</h3>
                <Link to="/rankings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Xem tất cả
                </Link>
              </div>
              
              <div className="space-y-4">
                {topRankings.map((manga, index) => (
                  <Link to={`/manga/${manga.id}`} key={manga.id} className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3">
                      <span className={`font-bold ${index < 3 ? 'text-primary-600' : 'text-gray-500'}`}>{index + 1}</span>
                    </div>
                    <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden mr-3">
                      <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{manga.title}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-yellow-500 mr-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-600">{manga.rating}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {manga.views}
                        </div>
                        {manga.trend === 'up' && (
                          <svg className="w-4 h-4 text-green-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                        {manga.trend === 'down' && (
                          <svg className="w-4 h-4 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <Link to="/rankings/most-viewed" className="text-sm text-gray-600 hover:text-primary-600">Xem nhiều nhất</Link>
                  <Link to="/rankings/highest-rated" className="text-sm text-gray-600 hover:text-primary-600">Đánh giá cao</Link>
                  <Link to="/rankings/trending" className="text-sm text-gray-600 hover:text-primary-600">Đang hot</Link>
                </div>
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Tin tức</h3>
                <Link to="/news" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Xem tất cả
                </Link>
              </div>
              
              <div className="space-y-6">
                {newsData.map(news => (
                  <div key={news.id} className="group">
                    <Link to={`/news/${news.id}`} className="block">
                      <div className="mb-2 overflow-hidden rounded-lg aspect-video">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{news.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{news.date}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{news.excerpt}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
