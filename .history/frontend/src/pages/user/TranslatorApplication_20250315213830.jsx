import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyTranslator } from '../../features/user/userSlice';

const TranslatorApplication = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    languages: [],
    experience: '',
    message: ''
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'languages') {
      const languagesArray = value.split(',').map(lang => lang.trim());
      setFormData({
        ...formData,
        [name]: languagesArray
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(applyTranslator(formData));
    
    if (applyTranslator.fulfilled.match(result)) {
      setSuccessMessage('Đơn đăng ký của bạn đã được gửi thành công và đang chờ phê duyệt');
      setFormData({ languages: [], experience: '', message: '' });
    }
  };
  
  // Kiểm tra nếu người dùng đã là dịch giả hoặc đang chờ phê duyệt
  if (user?.role === 'translator') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Trạng thái dịch giả</h2>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-700">Bạn đã là dịch giả trên hệ thống.</p>
        </div>
      </div>
    );
  }
  
  if (user?.translatorInfo?.status === 'pending') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Trạng thái đơn đăng ký</h2>
        <div className="bg-yellow-100 p-4 rounded">
          <p className="text-yellow-700">Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.</p>
        </div>
      </div>
    );
  }
  
  if (user?.translatorInfo?.status === 'rejected') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Trạng thái đơn đăng ký</h2>
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">Đơn đăng ký của bạn đã bị từ chối. Bạn có thể nộp lại đơn với thông tin chi tiết hơn.</p>
        </div>
        {successMessage && (
          <div className="bg-green-100 p-4 rounded mb-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="languages">
              Ngôn ngữ bạn có thể dịch (phân cách bằng dấu phẩy)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
              id="languages"
              name="languages"
              type="text"
              placeholder="Ví dụ: Tiếng Anh, Tiếng Nhật, Tiếng Hàn"
              value={formData.languages.join(', ')}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
              Kinh nghiệm dịch thuật
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
              id="experience"
              name="experience"
              rows="3"
              placeholder="Mô tả kinh nghiệm dịch thuật của bạn"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
              Lý do bạn muốn trở thành dịch giả
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
              id="message"
              name="message"
              rows="4"
              placeholder="Chia sẻ lý do tại sao bạn muốn trở thành dịch giả"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Đăng ký làm dịch giả</h2>
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
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="languages">
            Ngôn ngữ bạn có thể dịch (phân cách bằng dấu phẩy)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
            id="languages"
            name="languages"
            type="text"
            placeholder="Ví dụ: Tiếng Anh, Tiếng Nhật, Tiếng Hàn"
            value={formData.languages.join(', ')}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
            Kinh nghiệm dịch thuật
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
            id="experience"
            name="experience"
            rows="3"
            placeholder="Mô tả kinh nghiệm dịch thuật của bạn"
            value={formData.experience}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
            Lý do bạn muốn trở thành dịch giả
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
            id="message"
            name="message"
            rows="4"
            placeholder="Chia sẻ lý do tại sao bạn muốn trở thành dịch giả"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TranslatorApplication; 