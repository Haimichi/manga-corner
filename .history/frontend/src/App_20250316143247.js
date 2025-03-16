import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
// import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MangaDetail from './pages/MangaDetail';
import Header from './components/layout/Header';
// import Footer from './components/layout/Footer';
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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Kiểm tra token trong localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Xác thực token và lấy thông tin người dùng
          await dispatch(checkAuth()).unwrap();
          await dispatch(fetchUserProfile());
        }
      } catch (error) {
        console.error('Lỗi khởi tạo auth:', error);
      } finally {
        setInitializing(false);
      }
    };
    
    initAuth();
  }, [dispatch]);
  
  // Hiển thị spinner khi đang khởi tạo
  if (initializing) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
    </div>;
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
