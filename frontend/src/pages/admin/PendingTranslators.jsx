import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingTranslators, approveTranslator, rejectTranslator } from '../../features/user/userSlice';

const PendingTranslators = () => {
  const dispatch = useDispatch();
  const { pendingTranslators, loading, error } = useSelector((state) => state.user);
  
  useEffect(() => {
    dispatch(getPendingTranslators());
  }, [dispatch]);
  
  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt đơn đăng ký dịch giả này?')) {
      await dispatch(approveTranslator(id));
    }
  };
  
  const handleReject = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối đơn đăng ký dịch giả này?')) {
      await dispatch(rejectTranslator(id));
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Đã xảy ra lỗi: {error}</p>
        <p>Vui lòng thử lại sau.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn đăng ký dịch giả</h1>
      
      {pendingTranslators?.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">Không có đơn đăng ký dịch giả nào đang chờ phê duyệt.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngôn ngữ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kinh nghiệm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingTranslators.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.avatar || 'https://via.placeholder.com/150'} 
                          alt={user.username} 
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.translatorInfo?.languages?.join(', ') || 'Không có thông tin'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs overflow-hidden">
                      {user.translatorInfo?.experience || 'Không có thông tin'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.translatorInfo?.application?.applyDate 
                      ? new Date(user.translatorInfo.application.applyDate).toLocaleDateString('vi-VN') 
                      : 'Không có thông tin'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleApprove(user._id)}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      Phê duyệt
                    </button>
                    <button 
                      onClick={() => handleReject(user._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingTranslators; 