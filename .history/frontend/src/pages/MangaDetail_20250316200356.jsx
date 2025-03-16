import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { mangaApi } from '../services/api';

function MangaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [relatedManga, setRelatedManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const headerRef = useRef(null);
  const { isAuthenticated, user } = useSelector(state => state.auth) || { isAuthenticated: false, user: null };

  // Mẫu dữ liệu bình luận
  const sampleComments = [
    {
      id: 1,
      user: {
        id: 'user1',
        username: 'manga_lover',
        avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=1'
      },
      text: 'Truyện này quá hay, tôi đã đọc lại nhiều lần! Cốt truyện sâu sắc và phát triển nhân vật rất tốt.',
      date: '2023-06-10T08:30:00',
      likes: 24,
      replies: [
        {
          id: 11,
          user: {
            id: 'user2',
            username: 'otaku_123',
            avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=2'
          },
          text: 'Tôi đồng ý, chương mới nhất thực sự gây bất ngờ!',
          date: '2023-06-10T10:15:00',
          likes: 5
        }
      ]
    },
    {
      id: 2,
      user: {
        id: 'user3',
        username: 'critic_manga',
        avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=3'
      },
      text: 'Nghệ thuật đẹp nhưng cốt truyện hơi chậm ở vài chương giữa. Vẫn đáng để theo dõi.',
      date: '2023-06-09T14:45:00',
      likes: 16,
      replies: []
    },
    {
      id: 3,
      user: {
        id: 'user4',
        username: 'new_reader',
        avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=4'
      },
      text: 'Tôi mới bắt đầu đọc truyện này và không thể dừng lại! Có ai đề xuất truyện tương tự không?',
      date: '2023-06-08T19:20:00',
      likes: 8,
      replies: []
    }
  ];

  // Scroll effect cho header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 300) {
          headerRef.current.classList.add('bg-white', 'shadow-md');
          headerRef.current.classList.remove('bg-transparent');
        } else {
          headerRef.current.classList.remove('bg-white', 'shadow-md');
          headerRef.current.classList.add('bg-transparent');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch manga data
  const fetchMangaDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch manga details
      const response = await mangaApi.getMangaDetails(id);
      
      if (!response || !response.manga) {
        throw new Error('Không tìm thấy thông tin manga');
      }
      
      setManga(response.manga);
      setChapters(response.chapters || []);
      
      // Mẫu dữ liệu truyện liên quan
      const sampleRelated = [
        {
          id: 'd86cf65b-5f6c-437d-a0af-19a31f94ec55',
          attributes: {
            title: { en: 'Related Manga 1' },
            description: { en: 'Description for related manga 1' }
          },
          relationships: [
            {
              type: 'cover_art',
              attributes: { fileName: 'cover.jpg' }
            }
          ]
        },
        {
          id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
          attributes: {
            title: { en: 'Related Manga 2' },
            description: { en: 'Description for related manga 2' }
          },
          relationships: [
            {
              type: 'cover_art',
              attributes: { fileName: 'cover.jpg' }
            }
          ]
        },
        {
          id: '0aea9f43-b85a-4378-bad0-39f5075cf2d2',
          attributes: {
            title: { en: 'Related Manga 3' },
            description: { en: 'Description for related manga 3' }
          },
          relationships: [
            {
              type: 'cover_art',
              attributes: { fileName: 'cover.jpg' }
            }
          ]
        }
      ];
      
      setRelatedManga(sampleRelated);
      setComments(sampleComments);
      
      // Kiểm tra nếu truyện đã được bookmark
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.some(bookmark => bookmark.id === id));
      
    } catch (err) {
      console.error('Lỗi khi tải thông tin manga:', err);
      setError(err.message || 'Không thể tải thông tin manga');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMangaDetails();
  }, [fetchMangaDetails]);

  // Phương thức bổ sung
  const toggleBookmark = () => {
    if (!isAuthenticated) {
      // Chuyển hướng đến trang đăng nhập
      navigate('/login', { state: { from: `/manga/${id}` } });
      return;
    }
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (isBookmarked) {
      // Xóa bookmark
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      // Thêm bookmark
      bookmarks.push({
        id,
        title: getTitle(),
        coverUrl: getCoverImage(),
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleRating = (rating) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/manga/${id}` } });
      return;
    }
    
    setUserRating(rating);
    // Thêm logic gửi đánh giá lên server ở đây
  };

  const submitComment = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/manga/${id}` } });
      return;
    }
    
    if (!commentText.trim()) return;
    
    // Thêm bình luận mới
    const newComment = {
      id: new Date().getTime(),
      user: {
        id: user?.id || 'current_user',
        username: user?.username || 'current_user',
        avatar: user?.avatar || 'https://source.unsplash.com/random/100x100?portrait&sig=99'
      },
      text: commentText,
      date: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  // Hàm lấy title từ manga một cách an toàn
  const getTitle = () => {
    try {
      if (!manga?.attributes?.title) return 'Không có tiêu đề';
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      return 'Không có tiêu đề';
    }
  };

  // Hàm lấy mô tả
  const getDescription = () => {
    try {
      if (!manga?.attributes?.description) return 'Không có mô tả';
      
      const { description } = manga.attributes;
      return description.vi || description.en || Object.values(description)[0] || 'Không có mô tả';
    } catch (error) {
      return 'Không có mô tả';
    }
  };

    // Tiếp tục từ hàm getGenres()
    const getGenres = () => {
      try {
        if (!manga?.attributes?.tags) return [];
        
        return manga.attributes.tags
          .filter(tag => tag.attributes.group === 'genre')
          .map(tag => ({
            id: tag.id,
            name: tag.attributes.name.vi || tag.attributes.name.en || Object.values(tag.attributes.name)[0]
          }));
      } catch (error) {
        return [];
      }
    };
  
    // Hàm lấy ảnh bìa
    const getCoverImage = () => {
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
  
    // Hàm format thời gian
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch (error) {
        return 'Không rõ';
      }
    };
  
    // Hiển thị trạng thái loading
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Đang tải thông tin manga...</p>
          </div>
        </div>
      );
    }
  
    // Hiển thị thông báo lỗi
    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={fetchMangaDetails}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Thử lại
              </button>
              <Link
                to="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      );
    }
  
    // Hiển thị khi không tìm thấy manga
    if (!manga) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy manga</h2>
            <p className="text-gray-600 mb-6">Manga bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link
              to="/"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors inline-block"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/90"></div>
            <img 
              src={getCoverImage()} 
              alt={getTitle()}
              className="w-full h-full object-cover blur-sm"
            />
          </div>
          
          {/* Floating Header */}
          <div 
            ref={headerRef}
            className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-transparent"
          >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="text-white font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Trở về
              </Link>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleBookmark} 
                  className={`flex items-center ${isBookmarked ? 'text-yellow-500' : 'text-white'}`}
                >
                  <svg className="w-6 h-6" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  <span className="ml-1 hidden sm:inline">Đánh dấu</span>
                </button>
                
                <div className="relative group">
                  <button 
                    className="flex items-center text-white"
                    onMouseEnter={() => setShowRatingTooltip(true)}
                    onMouseLeave={() => setShowRatingTooltip(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    <span className="ml-1 hidden sm:inline">Đánh giá</span>
                  </button>
                  
                  {/* Rating Tooltip */}
                  {showRatingTooltip && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-20 w-64">
                      <div className="text-center mb-2 text-gray-800 font-medium">Đánh giá manga này</div>
                      <div className="flex items-center justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            onClick={() => handleRating(star)}
                            className={`w-8 h-8 ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <svg fill="currentColor" stroke="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                          </button>
                        ))}
                      </div>
                      {userRating > 0 && (
                        <div className="text-center mt-2 text-sm text-green-600">Cảm ơn bạn đã đánh giá!</div>
                      )}
                    </div>
                  )}
                </div>
                
                <button className="flex items-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  <span className="ml-1 hidden sm:inline">Chia sẻ</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Manga Info */}
          <div className="container mx-auto px-4 relative h-full flex items-end pb-12">
            <div className="flex flex-col md:flex-row items-start">
              {/* Cover Image */}
              <div className="w-40 h-60 md:w-48 md:h-72 flex-shrink-0 bg-white rounded-lg shadow-xl overflow-hidden -mb-20 md:-mb-28 z-10 border-4 border-white">
                <img 
                  src={getCoverImage()} 
                  alt={getTitle()}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setCoverLoaded(true)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/no-cover.jpg';
                    setCoverLoaded(true);
                  }}
                />
                {!coverLoaded && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-10 h-10 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Manga Details */}
              <div className="mt-4 md:mt-0 md:ml-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{getTitle()}</h1>
                
                <div className="flex flex-wrap items-center text-sm md:text-base mb-4 text-gray-200">
                  <div className="flex items-center mr-4 mb-2">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span>{manga.attributes.rating || '4.8'} (120 đánh giá)</span>
                  </div>
                  
                  <div className="flex items-center mr-4 mb-2">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>{chapters.length} chapter</span>
                  </div>
                  
                  <div className="flex items-center mr-4 mb-2">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span>{manga.attributes.views || '45,320'} lượt xem</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Cập nhật: {formatDate(manga.attributes.updatedAt || new Date())}</span>
                  </div>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getGenres().map(genre => (
                    <Link 
                      key={genre.id}
                      to={`/genre/${genre.id}`}
                      className="inline-block px-3 py-1 bg-primary-600 bg-opacity-80 rounded-full text-sm hover:bg-opacity-100 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {chapters.length > 0 && (
                    <Link
                      to={`/manga/${id}/chapter/${chapters[0].id}`}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Đọc ngay
                    </Link>
                  )}
                  
                  <button 
                    onClick={toggleBookmark}
                    className={`px-6 py-3 font-semibold rounded-lg transition-colors flex items-center ${
                      isBookmarked 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                    {isBookmarked ? 'Đã lưu' : 'Theo dõi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 pt-28 md:pt-32 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="flex border-b border-gray-200">
                  <button
                    className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                      activeTab === 'overview'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Tổng quan
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                      activeTab === 'chapters'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('chapters')}
                  >
                    Danh sách chapter
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                      activeTab === 'comments'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('comments')}
                  >
                    Bình luận
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-gray-900">Mô tả</h2>
                      <div className={`text-gray-700 whitespace-pre-line ${!showMoreDescription && 'line-clamp-5'}`}>
                        {getDescription()}
                      </div>
                      {getDescription().length > 300 && (
                        <button
                          onClick={() => setShowMoreDescription(!showMoreDescription)}
                          className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {showMoreDescription ? 'Rút gọn' : 'Xem thêm'}
                        </button>
                      )}
                      
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-gray-800">Thông tin</h3>
                          <div className="space-y-2 text-gray-700">
                            <p>
                              <span className="font-medium">Tác giả:</span>{' '}
                              {manga.relationships?.find(rel => rel.type === 'author')?.attributes?.name || 'Không rõ'}
                            </p>
                            <p>
                              <span className="font-medium">Họa sĩ:</span>{' '}
                              {manga.relationships?.find(rel => rel.type === 'artist')?.attributes?.name || 'Không rõ'}
                            </p>
                            <p>
                              <span className="font-medium">Trạng thái:</span>{' '}
                              {manga.attributes.status === 'ongoing' 
                                ? 'Đang tiến hành' 
                                : manga.attributes.status === 'completed' 
                                ? 'Đã hoàn thành' 
                                : 'Không rõ'}
                            </p>
                            <p>
                              <span className="font-medium">Năm xuất bản:</span>{' '}
                              {manga.attributes.year || 'Không rõ'}
                            </p>
                            <p>
                              <span className="font-medium">Đánh giá:</span>{' '}
                              <span className="flex items-center">
                                {manga.attributes.rating || '4.8'} 
                                <svg className="w-4 h-4 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                              </span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-gray-800">Thể loại</h3>
                          <div className="flex flex-wrap gap-2">
                            {getGenres().map(genre => (
                              <Link 
                                key={genre.id}
                                to={`/genre/${genre.id}`}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                              >
                                {genre.name}
                              </Link>
                            ))}
                            {getGenres().length === 0 && (
                              <span className="text-gray-500">Không có thông tin thể loại</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Chapters Tab */}
                  {activeTab === 'chapters' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Danh sách chapter</h2>
                        <div className="flex items-center">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Tìm chapter..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                          </div>
                          <select className="ml-2 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white pr-8 relative">
                            <option>Mới nhất</option>
                            <option>Cũ nhất</option>
                          </select>
                        </div>
                      </div>
                      
                      {chapters.length > 0 ? (
                        <div className="space-y-3">
                          {chapters.map(chapter => (
                            <Link
                              key={chapter.id}
                              to={`/manga/${id}/chapter/${chapter.id}`}
                              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="mr-3 w-12 h-12 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="font-bold text-primary-600">
                                    {chapter.attributes.chapter || '?'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    Chapter {chapter.attributes.chapter} 
                                  </span>
                                  {chapter.attributes.title && (
                                    <span className="text-gray-600">
                                      : {chapter.attributes.title}
                                    </span>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {formatDate(chapter.attributes.publishAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          <p className="text-gray-600">Hiện chưa có chapter nào cho manga này.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Comments Tab */}
                  {activeTab === 'comments' && (
                    <div>
                      <h2 className="text-xl font-bold mb-6 text-gray-900">Bình luận và đánh giá</h2>
                      
                      {/* Add comment form */}
                      <div className="mb-8">
                        <form onSubmit={submitComment}>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {isAuthenticated && user?.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-full h-full text-gray-400 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={isAuthenticated ? "Chia sẻ suy nghĩ của bạn về manga này..." : "Đăng nhập để bình luận..."}
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                rows="3"
                                disabled={!isAuthenticated}
                              ></textarea>
                              <div className="flex justify-end mt-2">
                                <button
                                  type="submit"
                                  className={`px-4 py-2 rounded-lg font-medium ${
                                    isAuthenticated && commentText.trim()
                                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  }`}
                                  disabled={!isAuthenticated || !commentText.trim()}
                                >
                                  Bình luận
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                      
                      {/* Comment list */}
                      <div className="space-y-6">
                        {comments.length > 0 ? (
                          comments.map(comment => (
                            <div key={comment.i