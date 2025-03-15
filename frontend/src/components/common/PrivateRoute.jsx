import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Sửa thành component không sử dụng Router
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    // Sử dụng Navigate thay vì Redirect
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;