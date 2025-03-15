import React, { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters, resetChapters } from '../features/mangadex/mangadexSlice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tab } from '@headlessui/react';
import { 
  FaEye, FaRegClock, FaUser, FaComment, FaAngleDown, FaAngleUp, 
  FaBookmark, FaShare, FaStar, FaExclamationTriangle, FaExternalLinkAlt,
  FaRandom, FaChevronLeft, FaChevronRight, FaRegStar, FaCalendarAlt, 
  FaTag, FaLanguage, FaInfoCircle, FaThumbsUp, FaThumbsDown, FaReply,
  FaBars, FaBook, FaComments, FaHeart, FaArrowRight
} from 'react-icons/fa';
import { HiChevronDown, HiX, HiOutlineBookOpen } from 'react-icons/hi';
import OptimizedImage from '../components/OptimizedImage';
import { Dialog, Transition } from '@headlessui/react';

// Component bình luận
const UserComment = ({ comment, onReply, onLike, onDislike }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };
  
  return (
    <div className="border-b border-gray-700 py-4">
      <div className="flex items-start gap-3">
        <img 
          src={comment.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.user.name} 
          alt={comment.user.name} 
          className="w-10 h-10 rounded-full"
        />
        
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-semibold text-white">{comment.user.name}</span>
            <span className="mx-2 text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
          </div>
          
          <p className="text-gray-300 mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <button 
              onClick={() => onLike(comment.id)} 
              className={`flex items-center gap-1 ${comment.userLiked ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <FaThumbsUp /> <span>{comment.likes || 0}</span>
            </button>
            
            <button 
              onClick={() => onDislike(comment.id)} 
              className={`flex items-center gap-1 ${comment.userDisliked ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <FaThumbsDown /> <span>{comment.dislikes || 0}</span>
            </button>
            
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)} 
              className="flex items-center gap-1 text-gray-500 hover:text-gray-300"
            >
              <FaReply /> <span>Trả lời</span>
            </button>
          </div>
          
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi của bạn..."
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 mb-2"
                rows="2"
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
                >
                  Gửi
                </button>
              </div>
            </form>
          )}
          
          {/* Hiển thị các comment phản hồi */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l border-gray-700 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <img 
                    src={reply.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + reply.user.name} 
                    alt={reply.user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-white">{reply.user.name}</span>
                      <span className="mx-2 text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: vi })}</span>
                    </div>
                    <p className="text-gray-300">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component phần bình luận (không có mock data)
const CommentsSection = ({ mangaId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hàm xử lý để đăng bình luận mới
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Trong trường hợp thực tế, sẽ gọi API để lưu bình luận
      const newCommentObj = {
        id: Date.now(),
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        dislikes: 0,
        user: {
          id: 999, // ID của người dùng đang đăng nhập
          name: 'Bạn',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser'
        },
        replies: []
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };
  
  const handleReply = (commentId, replyText) => {
    // Trong trường hợp thực tế, sẽ gọi API để lưu phản hồi
    const newComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              content: replyText,
              createdAt: new Date(),
              user: {
                id: 999,
                name: 'Bạn',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser'
              }
            }
          ]
        };
      }
      return comment;
    });
    
    setComments(newComments);
  };
  
  const handleLike = (commentId) => {
    // Trong trường hợp thực tế, sẽ gọi API để cập nhật lượt thích
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        if (comment.userLiked) {
          return { ...comment, likes: comment.likes - 1, userLiked: false };
        } else {
          const newLikes = comment.likes + 1;
          const newDislikes = comment.userDisliked ? comment.dislikes - 1 : comment.dislikes;
          
          return { 
            ...comment, 
            likes: newLikes, 
            dislikes: newDislikes,
            userLiked: true,
            userDisliked: false
          };
        }
      }
      return comment;
    }));
  };
  
  const handleDislike = (commentId) => {
    // Trong trường hợp thực tế, sẽ gọi API để cập nhật lượt không thích
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        if (comment.userDisliked) {
          return { ...comment, dislikes: comment.dislikes - 1, userDisliked: false };
        } else {
          const newDislikes = comment.dislikes + 1;
          const newLikes = comment.userLiked ? comment.likes - 1 : comment.likes;
          
          return { 
            ...comment, 
            dislikes: newDislikes, 
            likes: newLikes,
            userDisliked: true,
            userLiked: false
          };
        }
      }
      return comment;
    }));
  };
  
  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaComment className="mr-2 text-blue-400" /> 
          Bình luận ({comments.length})
        </h3>
        
        {/* Form bình luận mới */}
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn về truyện này..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 mb-3"
            rows="3"
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
              disabled={!newComment.trim()}
            >
              Gửi bình luận
            </button>
          </div>
        </form>
        
        {/* Danh sách bình luận */}
        <div className="space-y-1">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaComment className="mx-auto text-5xl mb-3 opacity-30" />
              <p>Chưa có bình luận nào. Hãy trở thành người đầu tiên bình luận!</p>
            </div>
          ) : (
            comments.map(comment => (
              <UserComment 
                key={comment.id} 
                comment={comment} 
                onReply={handleReply}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Component cho phần đề xuất truyện
const RecommendedManga = () => {
  // Danh sách truyện đề xuất mẫu
  const recommendations = [
    {
      id: '1',
      title: 'One Piece',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga1',
      rating: 4.9,
      genres: ['Phiêu lưu', 'Hành động', 'Hài hước']
    },
    {
      id: '2',
      title: 'Attack on Titan',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga2',
      rating: 4.8,
      genres: ['Kinh dị', 'Hành động', 'Giả tưởng']
    },
    {
      id: '3',
      title: 'Demon Slayer',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga3',
      rating: 4.7,
      genres: ['Siêu nhiên', 'Hành động', 'Lịch sử']
    },
    {
      id: '4',
      title: 'My Hero Academia',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga4',
      rating: 4.6,
      genres: ['Siêu anh hùng', 'Học đường', 'Hành động']
    },
    {
      id: '5',
      title: 'Jujutsu Kaisen',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga5',
      rating: 4.7,
      genres: ['Siêu nhiên', 'Hành động', 'Trường học']
    },
    {
      id: '6',
      title: 'Tokyo Revengers',
      coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga6',
      rating: 4.5,
      genres: ['Hành động', 'Băng đảng', 'Du hành thời gian']
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <FaRandom className="mr-2 text-purple-400" /> Truyện tương tự
        </div>
        <Link to="/manga" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
          Xem tất cả <FaArrowRight className="ml-1" />
        </Link>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map(manga => (
          <Link key={manga.id} to={`/manga/${manga.id}`} className="group">
            <div className="relative bg-gray-700 rounded-lg overflow-hidden">
              <div className="aspect-[2/3] overflow-hidden">
                <img 
                  src={manga.coverImage} 
                  alt={manga.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <div className="flex items-center mb-1">
                    <FaStar className="text-yellow-400 mr-1 text-xs" /> 
                    <span className="text-white text-xs">{manga.rating}</span>
                  </div>
                  <div className="text-xs text-gray-300 line-clamp-1">
                    {manga.genres.join(' • ')}
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="mt-2 text-sm font-medium text-white truncate">{manga.title}</h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Component danh sách chapter
const ChapterList = ({ mangaId }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState('all'); // 'all', 'vi', 'en'
  const chaptersPerPage = 20;
  const { chapters } = useSelector(state => state.mangadex);
  
  // Mảng các cờ quốc gia
  const FLAGS = {
    'vi': '🇻🇳',
    'en': '🇬🇧',
    'es': '🇪🇸',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'zh': '🇨🇳',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt-br': '🇧🇷',
    'ru': '🇷🇺'
  };

  // Nhóm chapters theo số chapter
  const groupChaptersByNumber = (chaptersArray) => {
    if (!chaptersArray || !Array.isArray(chaptersArray)) return {};
    
    const grouped = {};
    chaptersArray.forEach(chapter => {
      try {
        if (!chapter || !chapter.attributes) return;
        const chapterNum = chapter.attributes.chapter || 'unknown';
        
        // Lọc theo ngôn ngữ nếu đã chọn
        if (language !== 'all' && chapter.attributes.translatedLanguage !== language) return;
        
        if (!grouped[chapterNum]) {
          grouped[chapterNum] = [];
        }
        grouped[chapterNum].push(chapter);
      } catch (error) {
        console.error('Lỗi khi nhóm chapter:', error);
      }
    });
    return grouped;
  };

  const isChaptersArray = Array.isArray(chapters);
  const groupedChapters = groupChaptersByNumber(isChaptersArray ? chapters : []);
  
  // Sắp xếp các số chapter theo thứ tự giảm dần
  const sortedChapterNumbers = Object.keys(groupedChapters).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return parseFloat(b) - parseFloat(a);
  });

  // Phân trang
  const totalPages = Math.ceil(sortedChapterNumbers.length / chaptersPerPage);
  const currentChapters = sortedChapterNumbers.slice(
    (currentPage - 1) * chaptersPerPage,
    currentPage * chaptersPerPage
  );
  
  // Các hàm điều hướng
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Hàm toggle mở rộng chapter
  const toggleChapterExpand = (chapterNum) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  // Hàm lấy thời gian đăng
  const formatPublishTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    } catch {
      return 'N/A';
    }
  };
  
  // Hàm lấy tên nhóm dịch
  const getScanlationGroupName = (chapter) => {
    try {
      if (!chapter || !chapter.relationships) return 'Unknown';
      const group = chapter.relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };
  
  if (!isChaptersArray || chapters.length === 0) {
    return (
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-800 font-bold text-xl">Danh sách chapter</div>
        <div className="p-10 text-center">
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
          <p className="text-xl">Không có chapter nào cho truyện này</p>
          <p className="text-gray-400 mt-2">Có thể API chưa cập nhật hoặc chưa có bản dịch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="text-xl font-bold">Danh sách chapter</div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => { setLanguage('all'); setCurrentPage(1); }}
              className={`px-3 py-1 ${language === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => { setLanguage('vi'); setCurrentPage(1); }}
              className={`px-3 py-1 flex items-center ${language === 'vi' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button 
              onClick={() => { setLanguage('en'); setCurrentPage(1); }}
              className={`px-3 py-1 flex items-center ${language === 'en' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
      
      {currentChapters.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-xl">Không có chapter nào cho ngôn ngữ này</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {currentChapters.map(chapterNum => {
            const chapterGroup = groupedChapters[chapterNum];
            const isExpanded = expandedChapters[chapterNum] !== false;

            return (
              <div key={chapterNum} className="bg-gray-900 transition-colors duration-150">
                {/* Header của nhóm chapter */}
                <div 
                  onClick={() => toggleChapterExpand(chapterNum)}
                  className="p-4 bg-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <FaEye className="mr-2 text-gray-400" />
                    <span className="font-medium">Chapter {chapterNum}</span>
                  </div>
                  <div className="flex items-center">
                    {chapterGroup.length > 1 && (
                      <span className="px-2 py-1 mr-2 text-xs bg-gray-700 rounded-full">
                        {Object.keys(
                          chapterGroup.reduce((acc, ch) => {
                            acc[ch.attributes.translatedLanguage] = true;
                            return acc;
                          }, {})
                        ).map(lang => FLAGS[lang] || lang).join(' ')}
                      </span>
                    )}
                    {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                  </div>
                </div>
                
                {/* Danh sách các bản dịch của chapter */}
                {isExpanded && (
                  <div className="divide-y divide-gray-800">
                    {chapterGroup.map(chapter => (
                      <Link 
                        to={`/manga/${mangaId}/chapter/${chapter.id}`}
                        key={chapter.id} 
                        className="p-3 pl-8 hover:bg-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors block"
                      >
                        <div className="flex items-center mb-2 sm:mb-0">
                          <span className="mr-2 text-lg">
                            {FLAGS[chapter.attributes.translatedLanguage] || chapter.attributes.translatedLanguage}
                          </span>
                          <span className="font-medium">
                            {chapter.attributes.title || `Número${chapter.attributes.chapter}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                          <div className="flex items-center">
                            <FaRegClock className="mr-1" />
                            <span>{formatPublishTime(chapter.attributes.publishAt)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <FaUser className="mr-1" />
                            <span className="max-w-[150px] truncate">{getScanlationGroupName(chapter)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <FaEye className="mr-1" />
                            <span>N/A</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded flex items-center ${
              currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaChevronLeft className="mr-1" /> Trang trước
          </button>
          
          <div className="text-sm">
            Trang {currentPage} / {totalPages}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded flex items-center ${
              currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Trang sau <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

// Component chính
const MangaDetail = () => {
  const { mangaId } = useParams();
  const dispatch = useDispatch();
  const { manga, loading: mangaLoading, error: mangaError } = useSelector(state => state.mangadex);
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showFullCover, setShowFullCover] = useState(false);
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (mangaId) {
      dispatch(resetChapters());
      dispatch(getMangaDetailAsync(mangaId));
      // Scroll lên đầu trang
      window.scrollTo(0, 0);
    }
    
    return () => {
      // Cleanup khi component unmount
      dispatch(resetChapters());
    };
  }, [dispatch, mangaId]);
  
  // Khi có thông tin manga, cập nhật tiêu đề trang và rating
  useEffect(() => {
    if (manga && manga.attributes?.title) {
      document.title = `${getLocalizedValue(manga.attributes.title)} | Manga Corner`;
      // Random rating để demo
      setRating(Math.floor(Math.random() * 5) + 1);
    }
  }, [manga]);
  
  const getLocalizedValue = (obj, fallback = '') => {
    if (!obj) return fallback;
    
    // Thứ tự ưu tiên: vi -> en -> ja -> ko -> zh -> fallback
    const preferredLanguages = ['vi', 'en', 'ja', 'ko', 'zh'];
    
    for (const lang of preferredLanguages) {
      if (obj[lang] && obj[lang].trim()) {
        return obj[lang];
      }
    }
    
    // Nếu không tìm thấy ngôn ngữ ưu tiên, lấy giá trị đầu tiên có sẵn
    const firstAvailable = Object.values(obj).find(value => value && value.trim());
    return firstAvailable || fallback;
  };
  
  const getCoverImage = () => {
    try {
      if (!manga) return null;
      
      const relationships = manga.relationships || [];
      const cover = relationships.find(rel => rel.type === 'cover_art');
      
      if (!cover || !cover.attributes) {
        return null;
      }
      
      const fileName = cover.attributes.fileName;
      return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    } catch (error) {
      console.error('Lỗi khi lấy cover image:', error);
      return null;
    }
  };
  
  const getAuthors = () => {
    if (!manga || !manga.relationships) return [];
    
    return manga.relationships.filter(rel => rel.type === 'author' || rel.type === 'artist');
  };
  
  if (mangaLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <div className="w-20 h-20 mx-auto relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <FaBook className="text-blue-500 text-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-center mt-4 text-gray-300">Đang tải thông tin truyện...</p>
        </div>
      </div>
    );
  }
  
  if (mangaError || !manga) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto bg-red-900 border border-red-800 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Không thể tải thông tin truyện</h2>
          <p className="mb-4">{mangaError || 'Không tìm thấy dữ liệu truyện'}</p>
          <button
            onClick={() => dispatch(getMangaDetailAsync(mangaId))}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  const coverImage = getCoverImage();
  const title = getLocalizedValue(manga.attributes.title);
  const description = getLocalizedValue(manga.attributes.description);
  const hasLongDescription = description && description.length > 300;
  const truncatedDescription = hasLongDescription 
    ? `${description.slice(0, 300)}...` 
    : description;
  
  const displayDescription = isDescriptionExpanded ? description : truncatedDescription;
  const authors = getAuthors();
  
  return (
    <div className="relative bg-gray-900 min-h-screen pb-12">
      {/* Ảnh nền hero */}
      {coverImage && (
        <>
          <div 
            className="absolute top-0 left-0 w-full h-[400px] bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${coverImage})`,
              backgroundPosition: 'center 25%',
            }}
          />
          <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-black/70 via-gray-900/70 to-gray-900"></div>
        </>
      )}
      
      {/* Modal xem ảnh bìa đầy đủ */}
      <Transition show={showFullCover} as={Fragment}>
        <Dialog 
          as="div" 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setShowFullCover(false)}
        >
          <div className="min-h-screen flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-90" />
            
            <div className="relative bg-transparent max-w-4xl mx-auto">
              <button 
                onClick={() => setShowFullCover(false)}
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800/50 hover:bg-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
              
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt={title}
                  className="max-h-[90vh] max-w-full object-contain"
                />
              )}
            </div>