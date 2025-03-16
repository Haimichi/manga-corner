import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './components/layout/Header';  // Đảm bảo đường dẫn đúng
import Footer from './components/layout/Footer';  // Đảm bảo đường dẫn đúng
import Home from './pages/Home';
import MangaDetail from './pages/MangaDetail';
import Rankings from './pages/Rankings';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import ProtectedRoute from './components/ProtectedRoute';
import { loadUser } from './features/auth/authSlice';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Khôi phục token từ localStorage khi app khởi động
    const token = localStorage.getItem('token');
    if (token) {
      // Thiết lập token cho mọi request axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Token đã được khôi phục từ localStorage:', token.substring(0, 15) + '...');
      
      // Tải thông tin người dùng từ token
      dispatch(loadUser())
        .then(result => {
          console.log('Đã tải thông tin người dùng thành công');
        })
        .catch(error => {
          console.error('Lỗi khi tải thông tin người dùng:', error);
          // Nếu token hết hạn hoặc không hợp lệ, xóa khỏi localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        });
    }
  }, [dispatch]);

  return (
    <Router>
      {/* ... phần còn lại của component ... */}
    </Router>
  );
}

export default App; 