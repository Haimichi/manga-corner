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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-white mx-auto overflow-hidden border-4 border-white">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">{profile?.fullName || 'Người dùng'}</h1>
          <p className="text-white text-opacity-90">{profile?.email || 'Email không khả dụng'}</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin tài khoản</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tên người dùng</p>
              <p className="text-lg text-gray-900">{profile?.username || 'Không có thông tin'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{profile?.email || 'Không có thông tin'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Ngày tham gia</p>
              <p className="text-lg text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Không có thông tin'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Truyện đã đánh dấu</h2>
            
            {profile?.favorites && profile.favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.favorites.map(item => (
                  <div key={item.id} className="flex items-center p-2 border rounded-md hover:bg-gray-50">
                    <div className="w-12 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={item.coverUrl || '/images/no-cover.jpg'} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Bạn chưa đánh dấu truyện nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
