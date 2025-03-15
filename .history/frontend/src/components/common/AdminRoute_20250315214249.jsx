import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
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
  
  // Nếu không phải admin, chuyển hướng đến trang home
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Nếu đã xác thực và là admin, hiển thị component con
  return <Outlet />;
};

export default AdminRoute; 