import React, { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetailAsync, fetchMangaChapters, resetChapters } from '../features/mangadex/mangadexSlice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  FaEye, FaRegClock, FaUser, FaComment, FaAngleDown, FaAngleUp, 
  FaBookmark, FaStar, FaExclamationTriangle, FaExternalLinkAlt,
  FaRandom, FaChevronLeft, FaChevronRight, FaRegStar, FaCalendarAlt, 
  FaTag, FaLanguage, FaInfoCircle, FaThumbsUp, FaThumbsDown, FaReply,
  FaBars, FaBook, FaComments, FaHeart, FaArrowRight, FaSearch
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

// Component phần bình luận
const CommentsSection = ({ mangaId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
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
        
        {/* Quy định đăng bình luận */}
        <div className="mb-6 bg-gray-700 rounded-lg overflow-hidden">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-600 transition-colors"
          >
            <span className="text-white font-medium flex items-center">
              <FaInfoCircle className="mr-2 text-yellow-400" />
              Quy định đăng bình luận
            </span>
            {showRules ? <FaAngleUp className="text-gray-400" /> : <FaAngleDown className="text-gray-400" />}
          </button>
          
          {showRules && (
            <div className="p-4 bg-gray-700/50 text-gray-300">
              <p className="mb-2">Các quy định khi bình luận:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Không spam, quảng cáo phản cảm</li>
                <li>Không bình luận nội dung phản cảm, vi phạm pháp luật</li>
                <li>Không bình luận spoil nội dung truyện</li>
                <li>Tôn trọng các bạn đọc và tác giả</li>
              </ul>
            </div>
          )}
        </div>
        
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
const RecommendedManga = ({ tags, loading }) => {
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
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg aspect-[2/3]"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mt-2"></div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

// Component danh sách chapter
const ChapterList = ({ mangaId, chapters }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const chaptersPerPage = 20;
  
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
        
        // Lọc theo từ khóa tìm kiếm
        if (searchQuery && !chapterNum.includes(searchQuery) && 
            !(chapter.attributes.title && chapter.attributes.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return;
        }
        
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

  // Kiểm tra chapters là đối tượng có thuộc tính data hay mảng trực tiếp
  const chaptersData = chapters?.data || chapters;
  const isChaptersArray = Array.isArray(chaptersData);
  const groupedChapters = groupChaptersByNumber(isChaptersArray ? chaptersData : []);
  
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
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const toggleChapterExpand = (chapterNum) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterNum]: !prev[chapterNum]
    }));
  };

  const formatPublishTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    } catch {
      return 'N/A';
    }
  };
  
  const getScanlationGroupName = (chapter) => {
    try {
      if (!chapter || !chapter.relationships) return 'Unknown';
      const group = chapter.relationships.find(rel => rel.type === 'scanlation_group');
      return group?.attributes?.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };
  
  if (!isChaptersArray || chaptersData.length === 0) {
    return (
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-800 font-bold text-xl flex justify-between items-center">
          <h2>Danh sách chapter</h2>
          <span className="text-sm font-normal bg-red-600 px-2 py-1 rounded-md">Không có chapter</span>
        </div>
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
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaBook className="mr-2 text-blue-400" /> 
            Danh sách chapter 
            <span className="ml-2 text-sm font-normal bg-blue-600 px-2 py-1 rounded-md">
              {chaptersData.length} chapter
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm chapter..." 
                className="bg-gray-700 text-white rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setLanguage('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              language === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => { setLanguage('vi'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
              language === 'vi' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button 
            onClick={() => { setLanguage('en'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
              language === 'en' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🇬🇧 English
          </button>
          <button 
            onClick={() => { setLanguage('ja'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center ${
              language === 'ja' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🇯🇵 日本語
          </button>
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
            const firstChapter = chapterGroup[0];

            return (
              <div key={chapterNum} className="bg-gray-900 transition-colors duration-150">
                <div 
                  onClick={() => toggleChapterExpand(chapterNum)}
                  className="p-4 bg-gray-800 hover:bg-gray-700 transition-colors flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="mr-3 bg-gray-700 text-blue-400 h-10 w-10 rounded-full flex items-center justify-center">
                      <FaBook />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Chapter {chapterNum}</h3>
                      <p className="text-xs text-gray-400">
                        {firstChapter.attributes.title || `Lần cập nhật gần nhất: ${formatPublishTime(firstChapter.attributes.publishAt)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {chapterGroup.length > 1 && (
                      <span className="px-2 py-1 mr-2 text-xs bg-blue-900 text-blue-300 rounded-full">
                        {chapterGroup.length} bản dịch
                      </span>
                    )}
                    <span className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                      {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="divide-y divide-gray-800 bg-gray-850">
                    {chapterGroup.map(chapter => (
                      <Link 
                        to={`/manga/${mangaId}/chapter/${chapter.id}`}
                        key={chapter.id} 
                        className="p-4 pl-16 hover:bg-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors block border-l-4 border-blue-600"
                      >
                        <div className="flex items-center mb-2 sm:mb-0">
                          <span className="mr-2 text-lg">
                            {FLAGS[chapter.attributes.translatedLanguage] || chapter.attributes.translatedLanguage}
                          </span>
                          <span className="font-medium">
                            {chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`}
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
                          
                          <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-500 transition-colors">
                            <FaEye className="mr-1" />
                            <span>Đọc ngay</span>
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
      
      {totalPages > 1 && (
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${
              currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <FaChevronLeft className="mr-1" /> Trang trước
          </button>
          
          <div className="flex items-center">
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              const pageNum = currentPage <= 3 
                ? idx + 1 
                : currentPage + idx - 2 > totalPages 
                  ? totalPages - 4 + idx 
                  : currentPage + idx - 2;
              
              if (pageNum <= totalPages && pageNum > 0) {
                return (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 mx-1 rounded-md ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${
              currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
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
  const { manga, loading: mangaLoading, error: mangaError, chapters } = useSelector(state => state.mangadex);
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showFullCover, setShowFullCover] = useState(false);
  const [rating, setRating] = useState(0);
  const [relatedManga, setRelatedManga] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (mangaId) {
      dispatch(resetChapters());
      dispatch(getMangaDetailAsync(mangaId));
      dispatch(fetchMangaChapters(mangaId));
      
      // Scroll lên đầu trang
      window.scrollTo(0, 0);
    }
    
    return () => {
      // Cleanup khi component unmount
      dispatch(resetChapters());
    };
  }, [dispatch, mangaId]);
  
  // Lấy truyện cùng thể loại sau khi có thông tin manga
  useEffect(() => {
    if (manga && manga.attributes?.tags && manga.attributes.tags.length > 0) {
      setLoadingRelated(true);
      
      // Giả lập dữ liệu truyện tương tự - trong thực tế sẽ gọi API dựa trên tags
      setTimeout(() => {
        const mockRelatedManga = [
          {
            id: '1',
            title: 'One Piece',
            coverImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=manga1',
            rating: 4.9,