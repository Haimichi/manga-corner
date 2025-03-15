import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TranslatorRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
  
  // Nếu đang tải, hiển thị loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Nếu không xác thực, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu không phải dịch giả hoặc admin, chuyển hướng đến trang đăng ký dịch giả
  if (user?.role !== 'translator' && user?.role !== 'admin') {
    return <Navigate to="/apply-translator" replace />;
  }
  
  // Nếu đã xác thực và là dịch giả hoặc admin, hiển thị component con
  return <Outlet />;
};

export default TranslatorRoute; 