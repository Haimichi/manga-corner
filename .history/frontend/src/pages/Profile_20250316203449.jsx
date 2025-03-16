import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, getProfile } from '../features/user/userSlice';
import { FaUser, FaEnvelope, FaCameraRetro, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import { HiOutlineBookOpen } from 'react-icons/hi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OptimizedImage from '../components/OptimizedImage';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, preferences
  
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);
  
  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.fullName || '');
      setValue('username', profile.username || '');
      setValue('email', profile.email || '');
      setValue('bio', profile.bio || '');
      setAvatarPreview(profile.avatar || '');
    }
  }, [profile, setValue]);
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmitProfile = async (data) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    formData.append('bio', data.bio);
    
    if (avatar) {
      formData.append('avatar', avatar);
    }
    
    const result = await dispatch(updateProfile(formData));
    if (!result.error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  };
  
  const onSubmitPassword = async (data) => {
    // TODO: Xử lý đổi mật khẩu
    console.log('Password data:', data);
  };
  
  const onSubmitPreferences = async (data) => {
    // TODO: Xử lý cài đặt tùy chọn
    console.log('Preferences data:', data);
  };
  
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <HiOutlineBookOpen className="h-16 w-16 text-primary-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            Hồ Sơ Cá Nhân
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Quản lý thông tin tài khoản và tùy chọn cá nhân
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center mb-6">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center mb-6">
            <FaCheck className="mr-2" />
            <span>Cập nhật thông tin thành công!</span>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="p-6 bg-gray-800 border-r border-gray-700">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 mb-4">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <FaUser className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{profile?.fullName}</h3>
                <p className="text-sm text-gray-400">@{profile?.username}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Thông tin cá nhân
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'password' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('password')}
                >
                  Đổi mật khẩu
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'preferences' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('preferences')}
                >
                  Tùy chọn
                </button>
              </nav>
            </div>
            
            <div className="p-6 md:col-span-3">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit(onSubmitProfile)}>
                  <h3 className="text-xl font-bold text-white mb-6">Thông tin cá nhân</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Ảnh đại diện</label>
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 mr-4">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaUser className="text-2xl text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                          <FaCameraRetro className="inline-block mr-2" /> Thay đổi ảnh
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Họ tên</label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          {...register('fullName', {
                            required: 'Họ tên là bắt buộc'
                          })}
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tên người dùng</label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          {...register('username', {
                            required: 'Tên người dùng là bắt buộc',
                            pattern: {
                              value: /^[a-z0-9_.]+$/,
                              message: 'Tên người dùng chỉ chứa chữ thường, số, dấu gạch dưới và dấu chấm'
                            }
                          })}
                        />
                        {errors.username && (
                          <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          className="block w-full pl-10 px-3 py-2 border border-gray-600 rounded-lg bg-gray-600 text-gray-300 focus:outline-none"
                          disabled
                          {...register('email')}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Tiểu sử</label>
                      <textarea
                        rows="4"
                        className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Giới thiệu ngắn về bạn..."
                        {...register('bio')}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Đang lưu...</span>
                        </span>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'password' && (
                <form onSubmit={handleSubmit(onSubmitPassword)}>
                  <h3 className="text-xl font-bold text-white mb-6">Đổi mật khẩu</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        {...register('currentPassword', {
                          required: 'Mật khẩu hiện tại là bắt buộc'
                        })}
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.currentPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu mới</label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        {...register('newPassword', {
                          required: 'Mật khẩu mới là bắt buộc',
                          minLength: {
                            value: 8,
                            message: 'Mật khẩu phải có ít nhất 8 ký tự'
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                            message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
                          }
                        })}
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        {...register('confirmPassword', {
                          required: 'Xác nhận mật khẩu là bắt buộc',
                          validate: value => value === watch('newPassword') || 'Mật khẩu không khớp'
                        })}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Đang lưu...</span>
                        </span>
                      ) : (
                        'Đổi mật khẩu'
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'preferences' && (
                <form onSubmit={handleSubmit(onSubmitPreferences)}>
                  <h3 className="text-xl font-bold text-white mb-6">Tùy chọn cá nhân</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Ngôn ngữ ưa thích</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="lang-vi"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('preferredLanguages')}
                            value="vi"
                          />
                          <label htmlFor="lang-vi" className="ml-2 block text-sm text-gray-300">
                            Tiếng Việt
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="lang-en"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('preferredLanguages')}
                            value="en"
                          />
                          <label htmlFor="lang-en" className="ml-2 block text-sm text-gray-300">
                            Tiếng Anh
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="lang-ja"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('preferredLanguages')}
                            value="ja"
                          />
                          <label htmlFor="lang-ja" className="ml-2 block text-sm text-gray-300">
                            Tiếng Nhật
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Tùy chọn hiển thị</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="setting-reading-history"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('showReadingHistory')}
                          />
                          <label htmlFor="setting-reading-history" className="ml-2 block text-sm text-gray-300">
                            Hiển thị lịch sử đọc truyện
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="setting-mature"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('showMatureContent')}
                          />
                          <label htmlFor="setting-mature" className="ml-2 block text-sm text-gray-300">
                            Hiển thị nội dung 18+
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Thông báo</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="notification-email"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('emailNotifications')}
                          />
                          <label htmlFor="notification-email" className="ml-2 block text-sm text-gray-300">
                            Nhận thông báo qua email
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="notification-updates"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-500 rounded bg-gray-700"
                            {...register('updateNotifications')}
                          />
                          <label htmlFor="notification-updates" className="ml-2 block text-sm text-gray-300">
                            Thông báo khi có chapter mới
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Đang lưu...</span>
                        </span>
                      ) : (
                        'Lưu tùy chọn'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
