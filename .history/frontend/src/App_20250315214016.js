import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import TranslatorRoute from './components/common/TranslatorRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/user/Profile';
import TranslatorApplication from './pages/user/TranslatorApplication';
import CreateManga from './pages/manga/CreateManga';
import MyManga from './pages/manga/MyManga';
import MangaDetail from './pages/manga/MangaDetail';
import EditManga from './pages/manga/EditManga';
import PendingManga from './pages/admin/PendingManga';
import PendingTranslators from './pages/admin/PendingTranslators';

import { getProfile } from './features/user/userSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Routes công khai */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          
          {/* Routes yêu cầu đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/apply-translator" element={<TranslatorApplication />} />
          </Route>
          
          {/* Routes cho dịch giả */}
          <Route element={<TranslatorRoute />}>
            <Route path="/manga/create" element={<CreateManga />} />
            <Route path="/manga/edit/:id" element={<EditManga />} />
            <Route path="/dashboard/my-manga" element={<MyManga />} />
          </Route>
          
          {/* Routes cho admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/pending-manga" element={<PendingManga />} />
            <Route path="/admin/pending-translators" element={<PendingTranslators />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
