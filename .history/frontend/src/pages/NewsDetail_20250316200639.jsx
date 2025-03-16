import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  
  // Dữ liệu mẫu cho tin tức chi tiết (thường sẽ lấy từ API)
  const dummyNewsData = [
    {
      id: 1,
      title: 'Ra mắt manga mới: Dragon Slayer Academy',
      slug: 'ra-mat-manga-moi-dragon-slayer-academy',
      image: 'https://source.unsplash.com/random/1200x600?manga&sig=1',
      category: 'new-release',
      author: 'Admin',
      authorAvatar: 'https://source.unsplash.com/random/100x100?portrait&sig=1',
      date: '2023-06-15T08:30:00',
      excerpt: 'Series manga mới từ tác giả của One Piece đã chính thức ra mắt vào tuần này...',
      content: `<p>Eiichiro Oda, tác giả nổi tiếng của bộ manga One Piece, đã chính thức ra mắt series manga mới có tên là "Dragon Slayer Academy" sau nhiều tháng úp mở.</p>
      <p>Bộ truyện lấy bối cảnh tại một học viện đào tạo các thợ săn rồng trong một thế giới giả tưởng, nơi các loài rồng đe dọa sự tồn tại của loài người. Nhân vật chính là một cậu bé có khả năng giao tiếp với rồng - điều mà không ai trong thế giới này có thể làm được.</p>
      <div class="my-6">
        <img src="https://source.unsplash.com/random/900x500?dragon&sig=1" alt="Dragon Slayer Academy" class="w-full rounded-lg" />
        <p class="text-sm text-gray-500 mt-2 text-center">Hình ảnh minh họa từ tập đầu tiên của Dragon Slayer Academy</p>
      </div>
      <p>Chương đầu tiên đã nhận được sự đón nhận nồng nhiệt từ độc giả và giới phê bình. Nhiều người cho rằng đây sẽ là series tiếp theo thành công của Oda sau khi One Piece kết thúc.</p>
      <h2 class="text-2xl font-bold mt-8 mb-4">Đổi mới trong phong cách vẽ</h2>
      <p>Khác với One Piece với phong cách vẽ đặc trưng đã được duy trì trong hơn 20 năm, Dragon Slayer Academy mang một hơi hướng mới mẻ hơn. Oda đã thử nghiệm với các kỹ thuật mới, tạo ra một thế giới với nhiều chi tiết phức tạp hơn.</p>
      <p>"Tôi muốn thách thức bản thân với một cái gì đó hoàn toàn khác," Oda chia sẻ trong buổi phỏng vấn gần đây. "One Piece là đứa con tinh thần của tôi, nhưng tôi cũng muốn khám phá những chân trời mới trong nghệ thuật manga."</p>
      <div class="my-6">
        <img src="https://source.unsplash.com/random/900x500?artist&sig=2" alt="Eiichiro Oda" class="w-full rounded-lg" />
        <p class="text-sm text-gray-500 mt-2 text-center">Eiichiro Oda trong buổi họp báo ra mắt manga mới</p>
      </div>
      <h2 class="text-2xl font-bold mt-8 mb-4">Kế hoạch phát hành</h2>
      <p>Dragon Slayer Academy sẽ được xuất bản hàng tuần trên tạp chí Weekly Shonen Jump, bắt đầu từ số ra ngày 20/6/2023. Tập truyện đầu tiên dự kiến sẽ được phát hành vào tháng 10/2023 với nhiều nội dung bổ sung độc quyền.</p>
      <p>Kodansha, nhà xuất bản của manga này, đã tiết lộ rằng họ đang lên kế hoạch cho việc chuyển thể thành anime nếu manga nhận được sự ủng hộ tích cực từ độc giả.</p>
      <p>Bạn có thể đọc manga này trên ứng dụng của chúng tôi từ ngày hôm nay.</p>`,
      views: 4500,
      comments: [
        {
          id: 101,
          user: {
            name: 'Manga Lover',
            avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=2'
          },
          date: '2023-06-15T10:45:00',
          text: 'Tôi đã đọc chương đầu tiên và nó thực sự tuyệt vời! Phong cách vẽ mới của Oda-sensei thật ấn tượng.',
          likes: 24
        },
        {
          id: 102,
          user: {
            name: 'One Piece Fan',
            avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=3'
          },
          date: '2023-06-15T12:30:00',
          text: 'Tôi sẽ rất nhớ One Piece khi nó kết thúc, nhưng rất vui khi thấy Oda-sensei có dự án mới. Hy vọng nó sẽ thành công!',
          likes: 18
        }
      ],
      tags: ['Eiichiro Oda', 'Dragon Slayer Academy', 'Manga mới', 'Shonen Jump', 'Fantasy']
    },
    // Các tin tức khác có thể được thêm vào đây
  ];
  
  // Mẫu dữ liệu tin tức liên quan
  const dummyRelatedNews = [
    {
      id: 2,
      title: 'Anime adaptation cho "The Dark Mage Returns After 4000 Years"',
      slug: 'anime-adaptation-cho-the-dark-mage-returns-after-4000-years',
      image: 'https://source.unsplash.com/random/400x300?anime&sig=2',
      date: '2023-06-10T10:15:00',
      category: 'anime'
    },
    {
      id: 3,
      title: 'Top 10 manga được yêu thích nhất quý 2/2023',
      slug: 'top-10-manga-duoc-yeu-thich-nhat-quy-2-2023',
      image: 'https://source.unsplash.com/random/400x300?reading&sig=3',
      date: '2023-06-05T14:45:00',
      category: 'ranking'
    },
    {
      id: 4,
      title: 'Tác giả Jujutsu Kaisen tiết lộ kế hoạch kết thúc manga',
      slug: 'tac-gia-jujutsu-kaisen-tiet-lo-ke-hoach-ket-thuc-manga',
      image: 'https://source.unsplash.com/random/400x300?artist&sig=4',
      date: '2023-06-02T09:00:00',
      category: 'update'
    }
  ];

  const fetchNewsDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Trong dự án thực, bạn sẽ gọi API ở đây
      // const response = await api.getNewsDetail(slug);
      // setNews(response.data);
      
      // Dùng dữ liệu mẫu cho demo
      setTimeout(() => {
        const found = dummyNewsData.find(item => item.slug === slug);
        if (found) {
          setNews(found);
          setRelatedNews(dummyRelatedNews);
        } else {
          setError('Không tìm thấy bài viết');
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết tin tức:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchNewsDetail();
    
    // Cuộn lên đầu trang khi chuyển bài viết
    window.scrollTo(0, 0);
  }, [fetchNewsDetail]);

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

  // Xử lý submit comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Trong dự án thực, bạn sẽ gửi comment lên API
    console.log('Submitted comment:', comment);
    // Thêm comment giả vào danh sách
    if (news && comment.trim()) {
      const newComment = {
        id: Date.now(),
        user: {
          name: 'Khách',
          avatar: 'https://source.unsplash.com/random/100x100?portrait&sig=99'
        },
        date: new Date().toISOString(),
        text: comment,
        likes: 0
      };
      setNews({
        ...news,
        comments: [newComment, ...news.comments]
      });
      setComment('');
    }
  };

  // Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hiển thị khi có lỗi
  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-xl mx-auto">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
            <p className="text-gray-600 mb-6">{error || 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
            <button
              onClick={() => navigate('/news')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Quay lại trang tin tức
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <Link to="/news" className="hover:text-primary-600">Tin tức</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span className="text-gray-700 font-medium">{news.title}</span>
          </nav>

          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative aspect-video">
              <img 
                src={news.image} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={news.authorAvatar} alt={news.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">{news.author}</span>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span>{formatDate(news.date)}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      {news.views}
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
              <p className="text-xl text-gray-700 mb-4">{news.excerpt}</p>
            </div>
          </div>

          {/* Article Content and Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary-600"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />

                  {/* Tags */}
                  {news.tags && news.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {news.tags.map((tag, index) => (
                          <Link 
                            key={index}
                            to={`/news/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Chia sẻ bài viết</h3>
                    <div className="flex space-x-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                      <button className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482A13.98 13.98 0 011.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.5 6.2c1.8 0 2 1.7 2 2v1.5h-3v4h3V24h-3v-9.8h-2v-4h2V7.5c0-1.2-.5-2.8-2-2.8h-2V9h2c0-2 1.5-3 3-3z" />
                        </svg>
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Bình luận ({news.comments.length})</h3>
                  
                  {/* Comment Form */}
                  <div className="mb-8">
                    <form onSubmit={handleCommentSubmit}>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Để lại bình luận của bạn..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows="4"
                      ></textarea>
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-lg font-medium ${
                            comment.trim()
                              ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!comment.trim()}
                        >
                          Bình luận
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-6">
                    {news.comments.map(comment => (
                      <div key={comment.id} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={comment.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{comment.user.name}</h4>
                                <p className="text-xs text-gray-500">{formatDate(comment.date)}</p>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                                </svg>
                              </button>
                            </div>
                            <p className="mt-2 text-gray-700">{comment.text}</p>
                            <div className="mt-3 flex items-center text-sm">
                              <button className="flex items-center text-gray-500 hover:text-primary-600 mr-4">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                                </svg>
                                Thích ({comment.likes})
                              </button>
                              <button className="flex items-center text-gray-500 hover:text-primary-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                                Trả lời
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Related News */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tin tức liên quan</h3>
                  <div className="space-y-4">
                    {relatedNews.map(item => (
                      <Link 
                        key={item.id}
                        to={`/news/${item.slug}`}
                        className="flex items-start group"
                      >
                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden mr-3">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Popular Tags */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tags phổ biến</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Manga', 'Anime', 'One Piece', 'Shonen Jump', 'Jujutsu Kaisen', 'Solo Leveling', 'MangaDex', 'Chainsaw Man', 'Spy x Family', 'News'].map((tag, index) => (
                      <Link 
                        key={index}
                        to={`/news/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Newsletter */}
              <div className="bg-primary-50 rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Đăng ký nhận tin</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Nhận những tin tức mới nhất về manga và anime mỗi tuần.
                  </p>
                  <form>
                    <input 
                      type="email" 
                      placeholder="Nhập email của bạn" 
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                    />
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Đăng ký
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail; 