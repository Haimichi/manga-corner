import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPendingManga, approveManga, rejectManga } from '../../features/manga/mangaSlice';

const PendingManga = () => {
  const dispatch = useDispatch();
  const { pendingManga, loading, error } = useSelector((state) => state.manga);
  
  useEffect(() => {
    dispatch(fetchPendingManga());
  }, [dispatch]);
  
  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt truyện này?')) {
      await dispatch(approveManga(id));
    }
  };
  
  const handleReject = async (id) => {
    const reason = window.prompt('Vui lòng nhập lý do từ chối:');
    if (reason) {
      await dispatch(rejectManga({ id, reason }));
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
      <h1 className="text-2xl font-bold mb-6">Truyện chờ phê duyệt</h1>
      
      {pendingManga.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">Không có truyện nào đang chờ phê duyệt.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Truyện
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dịch giả
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thể loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingManga.map((manga) => (
                <tr key={manga._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={manga.coverImage || 'https://via.placeholder.com/150'} 
                          alt={manga.title?.vi || manga.title?.en} 
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {manga.title?.vi || manga.title?.en}
                        </div>
                        <div className="text-sm text-gray-500">
                          {manga.title?.en || manga.title?.vi}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {manga.creator?.username || 'Không xác định'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {manga.genres.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(manga.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/manga/${manga._id}/preview`} className="text-primary-600 hover:text-primary-800 mr-3">
                      Xem chi tiết
                    </Link>
                    <button 
                      onClick={() => handleApprove(manga._id)}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      Phê duyệt
                    </button>
                    <button 
                      onClick={() => handleReject(manga._id)}
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

export default PendingManga; 