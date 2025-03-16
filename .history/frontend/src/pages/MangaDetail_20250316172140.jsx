import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mangaApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaBookmark, FaRegBookmark, FaHistory, FaStar, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { followManga, unfollowManga } from '../features/user/userSlice';

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { followedMangaIds = [] } = useSelector(state => state.user);
  
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [isLoadingManga, setIsLoadingManga] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [error, setError] = useState(null);
  
  // Kiểm tra nếu đang theo dõi
  const isFollowing = manga && followedMangaIds.includes(manga.id);
  
  // Dùng AbortController để hủy request khi component unmount
  const abortControllerRef = useRef(new AbortController());
  
  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        // Đảm bảo id hợp lệ trước khi gọi API
        if (!id) {
          console.error('Manga ID không tồn tại');
          setError('Không tìm thấy manga - ID không hợp lệ');
          setIsLoadingManga(false);
          return;
        }
        
        console.log('MangaDetail - Đang tải thông tin manga với ID:', id);
        
        setIsLoadingManga(true);
        
        const mangaResponse = await mangaApi.getMangaDetails(id, { 
          signal: abortControllerRef.current.signal 
        });
        
        console.log('MangaDetail - Đã nhận response manga:', mangaResponse?.data?.id);
        
        if (mangaResponse && mangaResponse.data) {
          setManga(mangaResponse.data);
          setIsLoadingManga(false);
          
          // Sau khi có manga, tải danh sách chapter
          setIsLoadingChapters(true);
          
          // Đảm bảo id truyền vào API là đúng
          const chaptersResponse = await mangaApi.getChapters(id, { 
            limit: 100, 
            language: selectedLanguage,
            signal: abortControllerRef.current.signal 
          });
          
          console.log('MangaDetail - Đã nhận response chapters:', 
            chaptersResponse?.data?.length || 0, 'chapters');
          
          if (chaptersResponse && chaptersResponse.data) {
            setChapters(chaptersResponse.data);
          } else {
            console.warn('Không có chapters hoặc định dạng không hợp lệ');
            setChapters([]);
          }
          
          setIsLoadingChapters(false);
        } else {
          throw new Error('Không nhận được dữ liệu manga hợp lệ');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi khi tải thông tin manga:', error);
          setError('Không thể tải thông tin manga: ' + error.message);
          setIsLoadingManga(false);
          setIsLoadingChapters(false);
        }
      }
    };
    
    fetchMangaDetails();
    
    // Cleanup function để hủy request khi unmount
    return () => {
      abortControllerRef.current.abort();
    };
  }, [id, selectedLanguage]);
  
  // Hàm xử lý theo dõi/hủy theo dõi manga
  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
          return;
        }
        
    if (isFollowing) {
      dispatch(unfollowManga(manga.id));
    } else {
      dispatch(followManga(manga.id));
    }
  };
  
  // Lọc và sắp xếp danh sách chapter
  const sortedChapters = [...chapters].sort((a, b) => {
    const chapterA = parseFloat(a.chapter) || 0;
    const chapterB = parseFloat(b.chapter) || 0;
    return sortDesc ? chapterB - chapterA : chapterA - chapterB;
  });
  
  // Hiển thị loading khi đang tải manga
  if (isLoadingManga) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Hiển thị lỗi
  if (error) {
      return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-red-500 text-xl">{error}</h2>
        <button 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Thử lại
          </button>
        </div>
      );
    }

  // Hiển thị khi không tìm thấy manga
  if (!manga) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-xl text-white">Không tìm thấy manga</h2>
                      <Link 
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Trở về trang chủ
                      </Link>
            </div>
          );
  }
            
            return (
    <div className="container mx-auto px-4 py-8">
      {/* Thông tin manga */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Cover image */}
          <div className="md:w-1/3 lg:w-1/4">
            <img 
              src={manga.coverUrl || '/images/no-cover.png'} 
              alt={manga.title?.en || manga.title?.ja || 'Manga cover'} 
              className="w-full h-auto object-cover md:h-96"
              loading="eager" // Tải hình ảnh ngay lập tức không lazy load
            />
                </div>
          
          {/* Info */}
          <div className="p-4 md:w-2/3 lg:w-3/4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {manga.title?.en || manga.title?.ja || 'Không có tiêu đề'}
            </h1>
            
            <div className="flex flex-wrap text-sm text-gray-400 mb-4">
              {manga.author && <span className="mr-4">Tác giả: {manga.author}</span>}
              {manga.artist && <span className="mr-4">Họa sĩ: {manga.artist}</span>}
              {manga.status && <span className="mr-4">Trạng thái: {manga.status}</span>}
              {manga.year && <span>Năm: {manga.year}</span>}
                  </div>
                  
            <div className="flex flex-wrap gap-2 mb-4">
              {manga.tags && manga.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs rounded-full">
                  {tag}
                            </span>
                      ))}
                    </div>
            
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isFollowing ? 'bg-primary-500' : 'bg-gray-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <FaBookmark className="mr-2" />
                    Đang theo dõi
                  </>
                ) : (
                  <>
                    <FaRegBookmark className="mr-2" />
                    Theo dõi
                  </>
                )}
              </button>
              
              <button className="flex items-center px-4 py-2 bg-gray-700 rounded-md">
                <FaHistory className="mr-2" />
                Lịch sử đọc
          </button>
          
              <button className="flex items-center px-4 py-2 bg-gray-700 rounded-md">
                <FaStar className="mr-2" />
                Đánh giá
          </button>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Mô tả</h2>
              <div className="text-gray-300 space-y-2">
                {manga.description?.en || manga.description?.vi || 'Không có mô tả.'}
              </div>
            </div>
          </div>
        </div>
    </div>
      
      {/* Danh sách chapter */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Danh sách chapter</h2>
          
          <div className="flex space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
              <option value="ja">Tiếng Nhật</option>
            </select>
            
          <button
              onClick={() => setSortDesc(!sortDesc)}
              className="bg-gray-700 text-white rounded-md px-3 py-2 flex items-center"
            >
              {sortDesc ? (
                <>
                  <FaSortAmountDown className="mr-2" />
                  Giảm dần
                </>
              ) : (
                <>
                  <FaSortAmountUp className="mr-2" />
                  Tăng dần
                </>
                      )}
                    </button>
                </div>
              </div>

        {isLoadingChapters ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
                </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {sortedChapters.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {sortedChapters.map(chapter => (
                    <Link 
                    key={chapter.id}
                    to={`/manga/${manga.id}/chapter/${chapter.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <span className="text-white font-medium">
                        Chapter {chapter.chapter}
                      </span>
                      {chapter.title && (
                        <span className="ml-2 text-gray-400">
                          - {chapter.title}
                        </span>
                      )}
              </div>
                    <div className="text-sm text-gray-400">
                      {new Date(chapter.publishAt).toLocaleDateString()}
                    </div>
                      </Link>
                    ))}
                  </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                Không có chapter nào cho ngôn ngữ đã chọn
                </div>
              )}
                </div>
        )}
      </section>
    </div>
  );
};

export default MangaDetail;