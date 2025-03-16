import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { mangaApi } from '../services/api';
import axios from 'axios';

const Home = () => {
  const dispatch = useDispatch();
  const { latest: latestManga, popularManga, loading, error } = useSelector((state) => state.mangadex);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [bannerIndex, setBannerIndex] = useState(0);
  
  // Gọi API manga
  const fetchMangaData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      
      console.log('Đang tải dữ liệu manga...');
      
      await Promise.all([
        dispatch(fetchLatestManga({ limit: 18, page: 1 })).unwrap(),
        dispatch(fetchPopularManga({ limit: 18, page: 1 })).unwrap()
      ]);
      
      console.log('Tải dữ liệu manga thành công');
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu manga:', error);
      setLocalError(error.message || 'Không thể tải dữ liệu manga');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);
  
  useEffect(() => {
    fetchMangaData();
  }, [fetchMangaData]);
  
  // Tự động chuyển banner
  useEffect(() => {
    if (!popularManga || popularManga.length === 0) return;
    
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % Math.min(popularManga.length, 5));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [popularManga]);
  
  // Hàm lấy tiêu đề an toàn
  const getTitle = (manga) => {
    try {
      if (!manga?.attributes?.title) return 'Không có tiêu đề';
      const title = manga.attributes.title;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      return 'Không có tiêu đề';
    }
  };
  
  // Hàm lấy mô tả an toàn
  const getDescription = (manga) => {
    try {
      if (!manga?.attributes?.description) return '';
      const description = manga.attributes.description;
      const desc = description.vi || description.en || Object.values(description)[0] || '';
      return desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
    } catch (error) {
      return '';
    }
  };
  
  // Hàm lấy ảnh bìa manga
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
  
  // Hiển thị trạng thái loading
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      {popularManga && popularManga.length > 0 && (
        <div className="relative h-[500px] overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900">
          {popularManga.slice(0, 5).map((manga, index) => (
            <div
              key={manga.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === bannerIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black opacity-60"></div>
              <img
                src={getCoverImage(manga)}
                alt={getTitle(manga)}
                className="w-full h-full object-cover"
              />
              <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{getTitle(manga)}</h1>
                  <p className="text-lg mb-8 text-gray-200">{getDescription(manga)}</p>
                  <Link
                    to={`/manga/${manga.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md inline-flex items-center transition-colors"
                  >
                    Xem chi tiết
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Banner Navigation */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {popularManga.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBannerIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === bannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Error Message */}
        {(localError || error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">Đã xảy ra lỗi</h3>
                <p className="text-red-700 mt-1">{localError || error}</p>
                <button 
                  onClick={fetchMangaData}
                  className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`pb-4 text-lg font-medium transition-colors relative ${
                activeTab === 'latest'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('latest')}
            >
              Mới cập nhật
            </button>
            <button
              className={`pb-4 text-lg font-medium transition-colors relative ${
                activeTab === 'popular'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('popular')}
            >
              Phổ biến
            </button>
          </div>
        </div>

        {/* Manga Grid */}
        <div className={activeTab === 'latest' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Manga Mới Nhất</h2>
          {Array.isArray(latestManga) && latestManga.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {latestManga.map(manga => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-600 text-lg mb-4">Không có truyện mới để hiển thị</p>
              <button
                onClick={fetchMangaData}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Tải lại
              </button>
            </div>
          )}
        </div>

        <div className={activeTab === 'popular' ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Manga Phổ Biến</h2>
          {Array.isArray(popularManga) && popularManga.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularManga.map(manga => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-600 text-lg mb-4">Không có truyện phổ biến để hiển thị</p>
              <button
                onClick={fetchMangaData}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Tải lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
