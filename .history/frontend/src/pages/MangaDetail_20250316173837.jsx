import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mangaApi } from '../services/api';

function MangaDetail() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Thêm phương thức getMangaDetails vào mangaApi nếu chưa có
  const fetchMangaDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Đang tải thông tin manga với ID: ${id}`);
      
      if (!id) {
        throw new Error('ID manga không hợp lệ');
      }
      
      // Sử dụng phương thức getMangaDetails nếu tồn tại, nếu không thì thử các phương thức khác
      let response;
      try {
        if (typeof mangaApi.getMangaDetails === 'function') {
          response = await mangaApi.getMangaDetails(id);
        } else if (typeof mangaApi.getMangaDetail === 'function') {
          response = await mangaApi.getMangaDetail(id);
        } else {
          // Nếu không có phương thức nào phù hợp, tạo một request thủ công
          const resp = await fetch(`/mangadex/manga/${id}`);
          response = await resp.json();
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        
        // Gọi trực tiếp từ MangaDex API nếu backend không khả dụng
        const mangaResponse = await fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
        const chaptersResponse = await fetch(`https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=vi&translatedLanguage[]=en&order[chapter]=desc&limit=100`);
        
        const mangaData = await mangaResponse.json();
        const chaptersData = await chaptersResponse.json();
        
        response = {
          manga: mangaData.data,
          chapters: chaptersData.data || []
        };
      }
      
      if (!response || !response.manga) {
        throw new Error('Không tìm thấy thông tin manga');
      }
      
      console.log('Dữ liệu manga:', response);
      
      setManga(response.manga);
      setChapters(response.chapters || []);
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

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Manga Header */}
      <div 
        className="relative bg-cover bg-center h-64 sm:h-80 md:h-96"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getCoverImage()})` 
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-start">
            <div className="w-32 h-48 md:w-40 md:h-60 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden -mb-20 md:-mb-24 mr-6">
              <img 
                src={getCoverImage()} 
                alt={getTitle()}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/no-cover.jpg';
                }}
              />
            </div>
            <div className="mt-6 md:mt-0 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{getTitle()}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {getGenres().map(genre => (
                  <span 
                    key={genre.id}
                    className="bg-purple-600 bg-opacity-80 px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center mt-4">
                <div className="flex items-center mr-6">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span>{manga.attributes.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center mr-6">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                  <span>
                    {manga.attributes.status === 'ongoing' 
                      ? 'Đang tiến hành' 
                      : manga.attributes.status === 'completed' 
                      ? 'Đã hoàn thành' 
                      : 'Không rõ'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                  <span>
                    {manga.relationships?.find(rel => rel.type === 'author')?.attributes?.name || 'Không rõ'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manga Content */}
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Tổng quan
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'chapters'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('chapters')}
            >
              Danh sách chapter
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Mô tả</h2>
              <p className="text-gray-700 whitespace-pre-line">{getDescription()}</p>
              
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
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Thể loại</h3>
                  <div className="flex flex-wrap gap-2">
                    {getGenres().map(genre => (
                      <span 
                        key={genre.id}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                    {getGenres().length === 0 && (
                      <span className="text-gray-500">Không có thông tin thể loại</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Danh sách chapter</h2>
              
              {chapters.length > 0 ? (
                <div className="space-y-2">
                  {chapters.map(chapter => (
                    <Link
                      key={chapter.id}
                      to={`/chapter/${chapter.id}`}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="font-medium">Chapter {chapter.attributes.chapter} </span>
                        {chapter.attributes.title && (
                          <span className="text-gray-600">: {chapter.attributes.title}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(chapter.attributes.publishAt).toLocaleDateString('vi-VN')}
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
        </div>
      </div>
    </div>
  );
}

export default MangaDetail;