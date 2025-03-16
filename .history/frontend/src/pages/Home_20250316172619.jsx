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
  const { latestManga, popularManga, loading, error: reduxError } = useSelector((state) => state.mangadex);
  const [activeTab, setActiveTab] = useState('latest');
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideColors, setSlideColors] = useState([]);
  const canvasRef = useRef(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [error, setError] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [directLatestManga, setDirectLatestManga] = useState([]);
  const [directPopularManga, setDirectPopularManga] = useState([]);
  
  // Kiểm tra nếu không có dữ liệu - DI CHUYỂN PHẦN NÀY LÊN TRƯỚC
  const hasLatestManga = Array.isArray(latestManga) && latestManga.length > 0;
  const hasPopularManga = Array.isArray(popularManga) && popularManga.length > 0;
  
  // Thêm định nghĩa featuredGenres
  const featuredGenres = [
    { id: 'action', name: 'Hành động' },
    { id: 'romance', name: 'Tình cảm' },
    { id: 'fantasy', name: 'Giả tưởng' },
    { id: 'comedy', name: 'Hài hước' },
    { id: 'drama', name: 'Kịch tính' },
    { id: 'horror', name: 'Kinh dị' }
  ];
  
  // Sử dụng useCallback để tránh tạo lại hàm mỗi khi render
  const fetchLatestMangaData = useCallback(async () => {
    if (fetchAttempted) return; // Chỉ thử gọi API một lần để tránh lặp vô hạn
    
    try {
      setIsLoadingLatest(true);
      setError(null);
      setFetchAttempted(true);
      
      console.log('Home - Fetching latest manga...');
      
      // Dispatch action để lấy dữ liệu manga mới
      await dispatch(fetchLatestManga({ 
        limit: 18, 
        page: 1,
        retryCount 
      })).unwrap(); // unwrap để catch lỗi từ thunk
      
      console.log('Home - Dispatch fetchLatestManga hoàn tất');
    } catch (error) {
      console.error('Home - Lỗi khi tải manga mới nhất:', error);
      setError(error.message || 'Không thể tải manga mới nhất');
    } finally {
      setIsLoadingLatest(false);
    }
  }, [dispatch, fetchAttempted, retryCount]);

  const fetchPopularMangaData = useCallback(async () => {
    if (fetchAttempted) return; // Chỉ thử gọi API một lần để tránh lặp vô hạn
    
    try {
      setIsLoadingPopular(true);
      setError(null);
      setFetchAttempted(true);
      
      // Dispatch action để lấy dữ liệu manga phổ biến
      await dispatch(fetchPopularManga({ 
        limit: 18, 
        page: 1,
        retryCount 
      })).unwrap();
    } catch (error) {
      console.error('Home - Lỗi khi tải manga phổ biến:', error);
      setError(error.message || 'Không thể tải manga phổ biến');
    } finally {
      setIsLoadingPopular(false);
    }
  }, [dispatch, fetchAttempted, retryCount]);

  // Sử dụng useEffect với mảng dependency rỗng để chỉ tải dữ liệu một lần
  useEffect(() => {
    fetchLatestMangaData();
    fetchPopularMangaData();

    // Kích hoạt prefetch cho các API thường được sử dụng
    // Prefetch là để chuẩn bị trước dữ liệu cho người dùng
    const prefetchPopular = async () => {
      try {
        await mangaApi.getPopular(2, 18, 'vi'); // Prefetch trang 2
      } catch (error) {
        // Bỏ qua lỗi khi prefetch
      }
    };

    // Thực hiện prefetch sau khi trang đã load xong
    setTimeout(prefetchPopular, 2000);
  }, [fetchLatestMangaData, fetchPopularMangaData]);
  
  // Kiểm tra dữ liệu trước khi render
  useEffect(() => {
    console.log('Dữ liệu manga mới nhất:', latestManga?.length || 0, 'items');
    console.log('Dữ liệu manga phổ biến:', popularManga?.length || 0, 'items');
  }, [latestManga, popularManga]);
  
  // Hàm lấy giá trị màu sắc chủ đạo từ hình ảnh
  const getColorFromImage = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Cho phép tải hình ảnh từ domain khác
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Vẽ hình ảnh lên canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Lấy dữ liệu pixel từ canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Khởi tạo đối tượng để đếm số lần xuất hiện của mỗi màu
        const colorCounts = {};
        const sampleSize = 10; // Chỉ lấy mẫu 1/10 pixels để tăng hiệu suất
        
        // Tính toán giá trị màu
        for (let i = 0; i < imageData.length; i += 4 * sampleSize) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          
          // Bỏ qua các pixel gần trắng hoặc đen
          if ((r > 250 && g > 250 && b > 250) || (r < 10 && g < 10 && b < 10)) {
            continue;
          }
          
          const rgb = `${r},${g},${b}`;
          colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
        }
        
        // Tìm màu xuất hiện nhiều nhất
        let dominantRGB = '';
        let maxCount = 0;
        
        for (const rgb in colorCounts) {
          if (colorCounts[rgb] > maxCount) {
            maxCount = colorCounts[rgb];
            dominantRGB = rgb;
          }
        }
        
        // Tạo màu tối và màu sáng từ màu chủ đạo
        const [r, g, b] = dominantRGB.split(',').map(Number);
        
        // Tạo màu sắc chính
        const primary = `rgb(${r}, ${g}, ${b})`;
        
        // Tạo màu tối hơn cho nền
        const darkR = Math.max(Math.floor(r * 0.6), 0);
        const darkG = Math.max(Math.floor(g * 0.6), 0);
        const darkB = Math.max(Math.floor(b * 0.6), 0);
        const dark = `rgb(${darkR}, ${darkG}, ${darkB})`;
        
        // Tạo màu sáng hơn cho các phần tử tương tác
        const lightR = Math.min(Math.floor(r * 1.2), 255);
        const lightG = Math.min(Math.floor(g * 1.2), 255);
        const lightB = Math.min(Math.floor(b * 1.2), 255);
        const secondary = `rgb(${lightR}, ${lightG}, ${lightB})`;
        
        resolve({ primary, secondary, dark });
      };
      
      img.onerror = () => {
        // Trả về màu mặc định nếu không tải được hình ảnh
        resolve({ 
          primary: '#3B82F6', 
          secondary: '#60A5FA', 
          dark: '#1E40AF' 
        });
      };
      
      img.src = imageUrl;
    });
  };
  
  // Trích xuất màu từ hình ảnh khi có dữ liệu manga
  useEffect(() => {
    if (hasPopularManga) {
      const featuredManga = popularManga.slice(0, 6);
      
      // Tạo mảng promise để trích xuất màu từ hình ảnh
      const colorPromises = featuredManga.map(manga => {
        const coverUrl = getHighResolutionCover(manga);
        return getColorFromImage(coverUrl);
      });
      
      // Thực hiện tất cả promise và lưu kết quả
      Promise.all(colorPromises)
        .then(colors => {
          setSlideColors(colors);
        })
        .catch(error => {
          console.error("Lỗi khi trích xuất màu:", error);
        });
    }
  }, [popularManga, hasPopularManga]);
  
  // Timer tự động chuyển slide
  useEffect(() => {
    const timer = setInterval(() => {
      if (popularManga && popularManga.length > 0) {
        setActiveSlide((prev) => (prev + 1) % Math.min(6, popularManga.length));
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [popularManga]);
  
  // Hàm lấy ảnh bìa cho slide
  const getHighResolutionCover = (manga) => {
    try {
      if (!manga || !manga.relationships) return '/images/default-cover.jpg';
      
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return '/images/default-cover.jpg';
      }
      
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (error) {
      console.error("Lỗi lấy ảnh bìa:", error);
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
  
  // Fallback colors nếu chưa trích xuất được màu
  const defaultColors = [
    { primary: '#3B82F6', secondary: '#60A5FA', dark: '#1E40AF' }, // Xanh dương
    { primary: '#EF4444', secondary: '#F87171', dark: '#991B1B' }, // Đỏ
    { primary: '#10B981', secondary: '#34D399', dark: '#065F46' }, // Xanh lục
    { primary: '#8B5CF6', secondary: '#A78BFA', dark: '#5B21B6' }, // Tím
    { primary: '#F59E0B', secondary: '#FBBF24', dark: '#B45309' }, // Cam
    { primary: '#EC4899', secondary: '#F472B6', dark: '#9D174D' }  // Hồng
  ];
  
  // Render carousel
  const renderCarousel = () => {
    if (loading || !hasPopularManga) {
      return (
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 relative h-[500px] md:h-[550px] lg:h-[600px] animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    
    // Chỉ lấy 6 manga đầu tiên cho carousel
    const featuredManga = popularManga.slice(0, 6);
    
    return (
      <div className="relative h-[500px] md:h-[550px] lg:h-[600px]">
        {/* Slides */}
        {featuredManga.map((manga, index) => {
          // Lấy màu từ slideColors hoặc sử dụng màu mặc định nếu chưa có
          const slideColor = slideColors[index] || defaultColors[index % defaultColors.length];
          
          return (
            <div 
              key={manga.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background với màu */}
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ backgroundColor: slideColor.dark }}
              >
                <img 
                  src={getHighResolutionCover(manga)} 
                  alt={getTitle(manga)}
                  className="w-full h-full object-contain md:object-cover opacity-70"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-cover.jpg';
                  }}
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: `linear-gradient(to right, ${slideColor.dark} 0%, ${slideColor.dark}90 40%, transparent 100%)` 
                  }}
                ></div>
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
                      className="px-6 py-3 text-white rounded-md inline-flex items-center transition text-lg"
                      style={{ backgroundColor: slideColor.primary }}
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
          );
        })}
        
        {/* Điều hướng */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
          {featuredManga.map((_, index) => {
            const dotColor = slideColors[index]?.primary || defaultColors[index % defaultColors.length].primary;
            
            return (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeSlide 
                    ? 'w-8' 
                    : 'bg-opacity-50 hover:bg-opacity-75'
                }`}
                style={{ 
                  backgroundColor: index === activeSlide ? dotColor : '#ffffff80'
                }}
                aria-label={`Chuyển đến slide ${index + 1}`}
              />
            );
          })}
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
  
  // Component hiển thị lỗi và nút thử lại
  const ErrorDisplay = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5 my-5 text-center">
      <p className="text-red-600 mb-3">{error || reduxError}</p>
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => {
          setError(null);
          fetchLatestMangaData();
          fetchPopularMangaData();
        }}
      >
        Thử lại
      </button>
    </div>
  );
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Hàm gọi API từ redux
  const fetchMangaData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      
      console.log('Home - Fetching manga from Redux...');
      
      // Sử dụng Promise.all để gọi cả hai API
      await Promise.all([
        dispatch(fetchLatestManga({ 
          limit: 18, 
          page: 1
        })).unwrap(),
        dispatch(fetchPopularManga({ 
          limit: 18, 
          page: 1
        })).unwrap()
      ]);
      
      console.log('Home - Redux manga fetching completed');
    } catch (err) {
      console.error('Home - Lỗi khi tải dữ liệu manga từ Redux:', err);
      setLocalError(err.message || 'Không thể tải dữ liệu manga');
      
      // Nếu Redux thất bại, thử gọi trực tiếp từ MangaDex API
      fetchDirectFromMangaDex();
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);
  
  // Hàm gọi trực tiếp từ MangaDex API nếu backend không hoạt động
  const fetchDirectFromMangaDex = async () => {
    try {
      console.log('Thử gọi trực tiếp từ MangaDex API...');
      setIsLoading(true);
      
      // Gọi API manga mới nhất
      const latestResponse = await axios.get('https://api.mangadex.org/manga', {
        params: {
          limit: 18,
          offset: 0,
          includes: ['cover_art', 'author', 'artist'],
          contentRating: ['safe', 'suggestive'],
          order: { updatedAt: 'desc' },
          availableTranslatedLanguage: ['vi', 'en'],
          hasAvailableChapters: true
        }
      });
      
      // Gọi API manga phổ biến
      const popularResponse = await axios.get('https://api.mangadex.org/manga', {
        params: {
          limit: 18,
          offset: 0,
          includes: ['cover_art', 'author', 'artist'],
          contentRating: ['safe', 'suggestive'],
          order: { followedCount: 'desc' },
          availableTranslatedLanguage: ['vi', 'en'],
          hasAvailableChapters: true
        }
      });
      
      console.log('Đã lấy được manga từ MangaDex API trực tiếp');
      setDirectLatestManga(latestResponse.data.data || []);
      setDirectPopularManga(popularResponse.data.data || []);
    } catch (error) {
      console.error('Lỗi khi gọi trực tiếp từ MangaDex API:', error);
      setLocalError('Không thể kết nối đến MangaDex API. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMangaData();
  }, [fetchMangaData]);
  
  // Quyết định sử dụng dữ liệu từ Redux hay từ gọi trực tiếp
  const displayLatestManga = latestManga?.length > 0 ? latestManga : directLatestManga;
  const displayPopularManga = popularManga?.length > 0 ? popularManga : directPopularManga;
  
  // Kiểm tra dữ liệu trước khi render
  useEffect(() => {
    console.log('Dữ liệu manga mới nhất từ Redux:', latestManga?.length || 0, 'items');
    console.log('Dữ liệu manga phổ biến từ Redux:', popularManga?.length || 0, 'items');
    console.log('Dữ liệu manga mới nhất trực tiếp:', directLatestManga?.length || 0, 'items');
    console.log('Dữ liệu manga phổ biến trực tiếp:', directPopularManga?.length || 0, 'items');
  }, [latestManga, popularManga, directLatestManga, directPopularManga]);

  // Xử lý trường hợp đang loading
  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hiển thị lỗi nếu có */}
      {(localError || error) && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 my-8">
          <h2 className="text-xl font-semibold mb-3">Đã xảy ra lỗi</h2>
          <p>{localError || error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={fetchDirectFromMangaDex}
          >
            Thử tải trực tiếp từ MangaDex
          </button>
        </div>
      )}

      <div className="mb-10">
        <ul className="flex border-b">
          <li className="mr-2">
            <a className="inline-block px-4 py-2 text-purple-600 bg-white rounded-t-lg border-b-2 border-purple-600" href="#latest">
              Mới cập nhật
            </a>
          </li>
          <li className="mr-2">
            <a className="inline-block px-4 py-2 text-gray-600 hover:text-purple-600 bg-white rounded-t-lg" href="#popular">
              Phổ biến
            </a>
          </li>
        </ul>
      </div>
      
      {/* Manga mới nhất */}
      <section id="latest" className="mb-10">
        <h2 className="text-2xl font-bold mb-5">Manga Mới Nhất</h2>
        
        {Array.isArray(displayLatestManga) && displayLatestManga.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayLatestManga.map(manga => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Không có truyện mới để hiển thị</p>
            {!loading && !isLoading && (
              <button 
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                onClick={fetchDirectFromMangaDex}
              >
                Thử lại
              </button>
            )}
          </div>
        )}
      </section>
      
      {/* Manga phổ biến */}
      <section id="popular" className="mb-10">
        <h2 className="text-2xl font-bold mb-5">Manga Phổ Biến</h2>
        
        {Array.isArray(displayPopularManga) && displayPopularManga.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayPopularManga.map(manga => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Không có truyện phổ biến để hiển thị</p>
            {!loading && !isLoading && (
              <button 
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                onClick={fetchDirectFromMangaDex}
              >
                Thử lại
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
