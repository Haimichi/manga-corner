import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateProfile } from '../../features/user/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(formData));
    
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Thông tin cá nhân đã được cập nhật thành công');
      setIsEditing(false);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  const getTranslatorStatus = () => {
    if (!user) return null;
    
    if (user.role === 'translator') {
      return (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="text-green-700 font-semibold">Bạn đang là dịch giả trên hệ thống.</p>
        </div>
      );
    }
    
    if (user.translatorInfo?.status === 'pending') {
      return (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <p className="text-yellow-700 font-semibold">Đơn đăng ký làm dịch giả của bạn đang được xem xét.</p>
        </div>
      );
    }
    
    if (user.translatorInfo?.status === 'rejected') {
      return (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700 font-semibold">Đơn đăng ký làm dịch giả của bạn đã bị từ chối.</p>
          <p className="text-red-600 mt-2">Bạn có thể nộp lại đơn với thông tin chi tiết hơn.</p>
          <Link to="/apply-translator" className="text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block">
            Đăng ký lại
          </Link>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="text-gray-700">Bạn muốn đóng góp vào việc dịch truyện?</p>
        <Link to="/apply-translator" className="text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block">
          Đăng ký làm dịch giả
        </Link>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>
      
      {getTranslatorStatus()}
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 sm:mb-0 sm:mr-6">
            <img
              src={user.avatar || 'https://via.placeholder.com/128?text=Avatar'}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-700 mt-2">
              Vai trò: {
                user.role === 'admin' ? 'Quản trị viên' :
                user.role === 'translator' ? 'Dịch giả' :
                'Người dùng'
              }
            </p>
            <p className="text-gray-700">
              Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </p>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>
        
        {isEditing && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Tên người dùng
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="username"
                name="username"
                type="text"
                placeholder="Tên người dùng"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">
                URL ảnh đại diện
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="avatar"
                name="avatar"
                type="text"
                placeholder="URL ảnh đại diện"
                value={formData.avatar}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
        
        {user.role === 'translator' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Quản lý truyện</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/dashboard/my-manga"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Truyện của tôi
              </Link>
              <Link
                to="/manga/create"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Tạo truyện mới
              </Link>
            </div>
          </div>
        )}
        
        {user.role === 'admin' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Quản trị hệ thống</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/pending-manga"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Truyện chờ duyệt
              </Link>
              <Link
                to="/admin/pending-translators"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Đơn đăng ký dịch giả
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 