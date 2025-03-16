import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MangaDetail from './pages/MangaDetail';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import TranslatorRoute from './components/common/TranslatorRoute';
import MainLayout from './layouts/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './features/auth/authSlice';
import { fetchUserProfile } from './features/user/userSlice';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Profile from './pages/user/Profile';
import CreateManga from './pages/manga/CreateManga';
import MyManga from './pages/manga/MyManga';
import EditManga from './pages/manga/EditManga';
import PendingManga from './pages/admin/PendingManga';
import PendingTranslators from './pages/admin/PendingTranslators';
import ChapterReader from './pages/ChapterRead';
import ForgotPassword from './pages/ForgotPassword';

// ProtectedRoute component
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" color="primary" />
    </div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Hàm kiểm tra xác thực
    const initializeAuth = async () => {
      try {
        // Kiểm tra xem có token không
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log("Tìm thấy token, đang kiểm tra xác thực...");
          
          // Dispatch checkAuth để xác thực token
          await dispatch(checkAuth()).unwrap();
          console.log("Xác thực thành công!");
          
          // Lấy thông tin người dùng
          await dispatch(fetchUserProfile()).unwrap();
          console.log("Đã tải thông tin người dùng!");
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực:", error);
        // Xóa token nếu không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        // Đánh dấu ứng dụng đã sẵn sàng, bất kể xác thực thành công hay thất bại
        setAppReady(true);
      }
    };
    
    initializeAuth();
  }, [dispatch]);

  // Hiển thị màn hình loading khi đang khởi tạo ứng dụng
  if (!appReady) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner size="lg" color="primary" />
        <p className="ml-2 text-white">Đang tải...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Header />
        <main>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/manga/:id" element={<MangaDetail />} />
              <Route path="/manga/:mangaId/chapter/:chapterId" element={<ChapterReader />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              
              <Route element={<TranslatorRoute />}>
                <Route path="/manga/create" element={<CreateManga />} />
                <Route path="/manga/edit/:id" element={<EditManga />} />
                <Route path="/dashboard/my-manga" element={<MyManga />} />
              </Route>
              
              <Route element={<AdminRoute />}>
                <Route path="/admin/pending-manga" element={<PendingManga />} />
                <Route path="/admin/pending-translators" element={<PendingTranslators />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
