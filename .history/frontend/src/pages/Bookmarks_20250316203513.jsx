import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Bookmarks() {
  const { user } = useSelector(state => state.auth);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tải danh sách bookmarks từ localStorage hoặc từ API
    try {
      setLoading(true);
      const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
      setBookmarks(storedBookmarks);
    } catch (error) {
      console.error('Lỗi khi tải bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeBookmark = (id) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Truyện đã đánh dấu</h1>
      
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map(bookmark => (
            <div key={bookmark.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                <div className="w-1/3">
                  <Link to={`/manga/${bookmark.id}`}>
                    <img 
                      src={bookmark.coverUrl || '/images/no-cover.jpg'} 
                      alt={bookmark.title} 
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
                <div className="w-2/3 p-4">
                  <Link to={`/manga/${bookmark.id}`}>
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {bookmark.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-500 mb-4">Đã thêm: {new Date(bookmark.addedAt).toLocaleDateString('vi-VN')}</p>
                  <div className="flex justify-between">
                    <Link 
                      to={`/manga/${bookmark.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Xem chi tiết
                    </Link>
                    <button 
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có truyện nào được đánh dấu</h2>
          <p className="text-gray-600 mb-6">Hãy khám phá và đánh dấu những bộ manga bạn yêu thích để đọc sau.</p>
          <Link
            to="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Khám phá manga
          </Link>
        </div>
      )}
    </div>
  );
}

export default Bookmarks; 