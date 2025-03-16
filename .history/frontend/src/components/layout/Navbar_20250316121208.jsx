import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token và thông tin user mỗi khi component mount hoặc cập nhật
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error('Lỗi parse user data:', e);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Lắng nghe sự kiện storage change để cập nhật UI khi đăng nhập/đăng xuất
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 text-white py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">MANGA CORNER</Link>
          <div className="ml-6 space-x-4">
            <Link to="/" className="hover:text-gray-300">Trang chủ</Link>
            <Link to="/thu-vien" className="hover:text-gray-300">Thư viện</Link>
            <Link to="/moi-cap-nhat" className="hover:text-gray-300">Mới cập nhật</Link>
            <Link to="/pho-bien" className="hover:text-gray-300">Phổ biến</Link>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="relative mx-4">
            <input 
              type="text" 
              placeholder="Tìm kiếm truyện..." 
              className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none"
            />
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center">
              <div className="relative group">
                <button className="flex items-center space-x-1 hover:text-gray-300">
                  <FaUserCircle className="text-xl" />
                  <span>{user?.username || 'Người dùng'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Trang cá nhân</Link>
                  <Link to="/history" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Lịch sử đọc</Link>
                  <Link to="/favorites" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Truyện yêu thích</Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login" className="px-4 py-2 hover:text-gray-300">Đăng nhập</Link>
              <Link to="/register" className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 