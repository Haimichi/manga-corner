import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mangaApi } from '../services/api';

function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeTime, setActiveTime] = useState('all');
  const [limit, setLimit] = useState(20);
  
  // Mẫu dữ liệu
  const dummyRankings = [
    {
      id: 'd86cf65b-5f6c-437d-a0af-19a31f94ec55',
      rank: 1,
      title: 'One Piece',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=1',
      author: 'Eiichiro Oda',
      rating: 4.9,
      views: 1200000,
      chapters: 1084,
      trend: 'up',
      description: 'Theo chân cuộc phiêu lưu của Luffy và băng hải tặc Mũ Rơm trong hành trình tìm kiếm kho báu One Piece...'
    },
    {
      id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
      rank: 2,
      title: 'Jujutsu Kaisen',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=2',
      author: 'Gege Akutami',
      rating: 4.8,
      views: 987000,
      chapters: 220,
      trend: 'up',
      description: 'Yuji Itadori, một học sinh trung học với khả năng thể chất phi thường, đã vô tình nuốt phải một vật thể bị nguyền...'
    },
    {
      id: '0aea9f43-b85a-4378-bad0-39f5075cf2d2',
      rank: 3,
      title: 'Solo Leveling',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=3',
      author: 'Chugong',
      rating: 4.7,
      views: 842000,
      chapters: 179,
      trend: 'down',
      description: 'Trong một thế giới đầy những "thợ săn" với sức mạnh ma thuật, Sung Jin-Woo là người yếu nhất...'
    },
    {
      id: 'a5ead0e3-9a05-4c8c-86c5-c6a850ab0163',
      rank: 4,
      title: 'Chainsaw Man',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=4',
      author: 'Tatsuki Fujimoto',
      rating: 4.6,
      views: 756000,
      chapters: 129,
      trend: 'up',
      description: 'Denji là một thiếu niên nghèo đói sống cùng với con quỷ cưa máy tên Pochita...'
    },
    {
      id: '4299c8c3-a3e7-44dd-9a76-f0f0ecbe428d',
      rank: 5,
      title: 'My Hero Academia',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=5',
      author: 'Kohei Horikoshi',
      rating: 4.5,
      views: 701000,
      chapters: 372,
      trend: 'same',
      description: 'Trong một thế giới mà đa số dân số đều có siêu năng lực, Izuku Midoriya, một cậu bé không có năng lực...'
    },
    {
      id: 'b8f23090-0b51-4692-921c-e67b20e25bf5',
      rank: 6,
      title: 'Demon Slayer',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=6',
      author: 'Koyoharu Gotouge',
      rating: 4.4,
      views: 689000,
      chapters: 205,
      trend: 'down',
      description: 'Tanjiro Kamado cùng em gái của mình là Nezuko, người duy nhất còn sống sót sau vụ thảm sát gia đình...'
    },
    {
      id: 'c72e4aab-6f14-4f1e-8687-7a30d3491bc7',
      rank: 7,
      title: 'Black Clover',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=7',
      author: 'Yūki Tabata',
      rating: 4.3,
      views: 632000,
      chapters: 348,
      trend: 'up',
      description: 'Asta và Yuno là hai đứa trẻ bị bỏ rơi được nuôi dưỡng trong cùng một nhà thờ...'
    },
    {
      id: 'd45e8f1d-8491-4a03-9b5d-0e67c2e0a890',
      rank: 8,
      title: 'Attack on Titan',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=8',
      author: 'Hajime Isayama',
      rating: 4.8,
      views: 598000,
      chapters: 139,
      trend: 'same',
      description: 'Trong một thế giới nơi loài người phải sống trong những bức tường thành để bảo vệ khỏi những Titan...'
    },
    {
      id: 'e5723f2e-9b8a-4d12-a87f-1389c76a2e6f',
      rank: 9,
      title: 'Tokyo Revengers',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=9',
      author: 'Ken Wakui',
      rating: 4.2,
      views: 567000,
      chapters: 278,
      trend: 'up',
      description: 'Takemichi Hanagaki, một thanh niên thất nghiệp 26 tuổi, phát hiện rằng cô bạn gái thời trung học đã bị giết...'
    },
    {
      id: 'f6932c4f-a128-4e3b-bc0e-9d2368611ad2',
      rank: 10,
      title: 'The Beginning After the End',
      cover: 'https://source.unsplash.com/random/300x400?manga&sig=10',
      author: 'TurtleMe',
      rating: 4.7,
      views: 523000,
      chapters: 170,
      trend: 'up',
      description: 'King Grey có tất cả sức mạnh, giàu có, danh tiếng trong một thế giới được cai trị bởi năng lực võ thuật...'
    }
  ];

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Trong dự án thực, bạn sẽ thay đổi API call này
      // const response = await mangaApi.getRankings({ category: activeCategory, time: activeTime, limit });
      // setRankings(response.data);
      
      // Dùng dữ liệu mẫu cho demo
      setTimeout(() => {
        setRankings(dummyRankings);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tải bảng xếp hạng:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setLoading(false);
    }
  }, [activeCategory, activeTime, limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Các danh mục bảng xếp hạng
  const categories = [
    { id: 'popular', name: 'Phổ biến nhất' },
    { id: 'trending', name: 'Xu hướng' },
    { id: 'newest', name: 'Mới nhất' },
    { id: 'rating', name: 'Đánh giá cao' },
    { id: 'completed', name: 'Đã hoàn thành' }
  ];

  // Các khoảng thời gian
  const timeFrames = [
    { id: 'all', name: 'Tất cả thời gian' },
    { id: 'month', name: 'Tháng này' },
    { id: 'week', name: 'Tuần này' },
    { id: 'day', name: 'Hôm nay' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bảng xếp hạng Manga</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Khám phá những manga phổ biến nhất, được đánh giá cao nhất và đang là xu hướng trong cộng đồng độc giả.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {timeFrames.map(time => (
                <button
                  key={time.id}
                  onClick={() => setActiveTime(time.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTime === time.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {time.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rankings List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchRankings}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rankings.map((manga, index) => (
              <div 
                key={manga.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Rank indicator */}
                  <div className="flex items-center justify-center md:w-16 flex-shrink-0 bg-gray-100 py-4 md:py-0">
                    <span className={`text-2xl font-bold ${index < 3 ? 'text-primary-600' : 'text-gray-700'}`}>
                      #{manga.rank}
                    </span>
                  </div>
                  
                  {/* Cover image */}
                  <div className="md:w-48 h-64 md:h-auto flex-shrink-0 relative">
                    <img 
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className={`flex items-center rounded-full px-2 py-1 text-xs ${
                        manga.trend === 'up' 
                          ? 'bg-green-500 text-white' 
                          : manga.trend === 'down' 
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {manga.trend === 'up' && (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                          </svg>
                        )}
                        {manga.trend === 'down' && (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                          </svg>
                        )}
                        {manga.trend === 'same' && (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                          </svg>
                        )}
                        <span>
                          {manga.trend === 'up' ? 'Tăng' : manga.trend === 'down' ? 'Giảm' : 'Giữ nguyên'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <Link to={`/manga/${manga.id}`} className="inline-block">
                        <h2 className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
                          {manga.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">Tác giả:</span> {manga.author}
                      </p>
                      <p className="text-gray-700 mt-3 line-clamp-2">
                        {manga.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center mt-4 space-x-5 text-sm">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="text-gray-700">{manga.rating}/5.0</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <span className="text-gray-700">{(manga.views / 1000).toFixed(0)}k</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <span className="text-gray-700">{manga.chapters} chapter</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link 
                        to={`/manga/${manga.id}`} 
                        className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                      >
                        Chi tiết
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </Link>
                      
                      {manga.chapters > 0 && (
                        <Link 
                          to={`/manga/${manga.id}/chapter/1`} 
                          className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center ml-4"
                        >
                          Đọc ngay
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && (
          <div className="mt-10 text-center">
            <button 
              onClick={() => setLimit(prev => prev + 10)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
            >
              Tải thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rankings; 