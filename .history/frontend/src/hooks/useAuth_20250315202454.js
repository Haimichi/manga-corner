import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { setUser, logout } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && !user) {
          const response = await authApi.getProfile();
          dispatch(setUser(response.data.data));
        }
      } catch (error) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch, user]);

  const requireAuth = (callback) => {
    if (!user) {
      navigate('/login');
      return;
    }
    callback();
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    requireAuth
  };
};
