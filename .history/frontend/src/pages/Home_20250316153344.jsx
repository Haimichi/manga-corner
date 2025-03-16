import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLatestManga, fetchPopularManga } from '../features/mangadex/mangadexSlice';
import MangaCard from '../components/MangaCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { mangaApi } from '../services/api';

const Home = () => {
  const dispatch = useDispatch();
  const { latestManga, popularManga, loading } = useSelector((state) => state.mangadex);
  const [activeTab, setActiveTab] = useState('latest');
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideColors, setSlideColors] = useState([]);
  const canvasRef = useRef(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [error, setError] = useState(null);
  
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
  const fetchLatestManga = useCallback(async () => {
    try {
      setIsLoadingLatest(true);
      setError(null); // Reset lỗi trước khi gọi API
      
      // Đảm bảo tham số đúng format
      const response = await mangaApi.getLatest({ 
        page: 1, 
        limit: 18 
      });
      
      console.log('Latest manga response:', response);
      
      // Cập nhật UI trước khi dispatch action
      if (!response || !response.data) {
        setError('Không thể tải manga mới nhất');
        return;
      }
      
      // Dispatch action để cập nhật redux store
      dispatch(fetchLatestManga({ 
        limit: 18, 
        offset: 0,
        sort: 'updatedAt',
        order: 'desc'
      }));
      
    } catch (error) {
      console.error('Lỗi khi tải manga mới nhất:', error);
      setError('Không thể tải manga mới nhất');
    } finally {
      setIsLoadingLatest(false);
    }
  }, [dispatch]);

  const fetchPopularManga = useCallback(async () => {
    try {
      setIsLoadingPopular(true);
      setError(null); // Reset lỗi trước khi gọi API
      
      const response = await mangaApi.getPopular({ 
        page: 1, 
        limit: 18, 
        language: 'vi' 
      });
      
      console.log('Popular manga response:', response);
      
      // Cập nhật UI trước khi dispatch action
      if (!response || !response.data) {
        setError('Không thể tải manga phổ biến');
        return;
      }
      
      // Dispatch action để cập nhật redux store
      dispatch(fetchPopularManga({ 
        limit: 18, 
        offset: 0 
      }));
      
    } catch (error) {
      console.error('Lỗi khi tải manga phổ biến:', error);
      setError('Không thể tải manga phổ biến');
    } finally {
      setIsLoadingPopular(false);
    }
  }, [dispatch]);

  // Sử dụng useEffect với mảng dependency rỗng để chỉ tải dữ liệu một lần
  useEffect(() => {
    fetchLatestManga();
    fetchPopularManga();

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
  }, [fetchLatestManga, fetchPopularManga]);
  
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
  
  // Hiển thị loading khi đang tải dữ liệu
  if (isLoadingLatest && isLoadingPopular) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-red-500 text-xl">{error}</h2>
        <button 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md"
          onClick={() => {
            setError(null);
            fetchLatestManga();
            fetchPopularManga();
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Slide carousel */}
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
    </div>
  );
};

export default Home;
