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

  // Hàm lấy thể loại
  const getGenres = () => {
    try {
      if (!manga?.attributes?.tags) return [];
      
      return manga.attributes.tags
        .filter(tag => tag.attributes.group === 'genre')
        .map(tag => ({