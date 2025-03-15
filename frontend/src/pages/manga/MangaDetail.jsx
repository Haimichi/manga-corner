import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMangaDetail } from '../../features/manga/mangaSlice';
import { getChaptersByMangaId } from '../../features/chapter/chapterSlice';

const MangaDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { mangaDetail, loading: mangaLoading, error: mangaError } = useSelector((state) => state.manga);
  const { chapters, loading: chaptersLoading, error: chaptersError } = useSelector((state) => state.chapter);
  const { user } = useSelector((state) => state.user);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    if (id) {
      dispatch(getMangaDetail(id));
      dispatch(getChaptersByMangaId(id));
    }
  }, [dispatch, id]);
  
  if (mangaLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (mangaError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600 p-4">
          <p>Đã xảy ra lỗi: {mangaError}</p>
          <p>Không thể tải thông tin truyện.</p>
        </div>
      </div>
    );
  }
  
  if (!mangaDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 p-4">
          <p>Không tìm thấy truyện.</p>
        </div>
      </div>
    );
  }
  
  // Ưu tiên hiển thị tiếng Việt
  const title = mangaDetail.title?.vi || mangaDetail.title?.en || 'Không có tiêu đề';
  const description = mangaDetail.description?.vi || mangaDetail.description?.en || 'Không có mô tả';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row">
          <div className="w-full md:w-48 flex-shrink-0 mb-6 md:mb-0 md:mr-8">
            <img
              src={mangaDetail.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}
              alt={title}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
            
            {isAuthenticated && (
              <div className="mt-4 flex flex-col space-y-2">
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 w-full">
                  Theo dõi
                </button>
                
                {(user?.role === 'translator' || user?.role === 'admin') && (
                  <>
                    {(mangaDetail.creator === user?._id || mangaDetail.translators?.includes(user?._id) || user?.role === 'admin') && (
                      <Link 
                        to={`/manga/edit/${id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-center"
                      >
                        Chỉnh sửa
                      </Link>
                    )}
                    
                    {(mangaDetail.creator === user?._id || mangaDetail.translators?.includes(user?._id)) && (
                      <Link 
                        to={`/manga/${id}/add-chapter`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-center"
                      >
                        Thêm chapter
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            
            {mangaDetail.alternativeTitles?.length > 0 && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Tên khác:</span> {mangaDetail.alternativeTitles.join(', ')}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {mangaDetail.genres?.map((genre, index) => (
                <Link
                  key={index}
                  to={`/manga/genre/${encodeURIComponent(genre)}`}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  {mangaDetail.status === 'ongoing' 
                    ? 'Đang tiến hành' 
                    : mangaDetail.status === 'completed' 
                    ? 'Đã hoàn thành' 
                    : 'Tạm ngưng'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Lượt xem:</span> {mangaDetail.views || 0}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Theo dõi:</span> {mangaDetail.followCount || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Đánh giá:</span> {mangaDetail.avgRating || 0}/5 ({mangaDetail.ratingCount || 0} đánh giá)
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Chapter mới nhất:</span> {mangaDetail.lastChapter || 'Chưa có'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Cập nhật:</span> {new Date(mangaDetail.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'info' 
                      ? 'text-primary-600 border-b-2 border-primary-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Giới thiệu
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'chapters' 
                      ? 'text-primary-600 border-b-2 border-primary-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('chapters')}
                >
                  Danh sách chapter
                </button>
              </div>
              
              <div className="py-4">
                {activeTab === 'info' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{description}</p>
                  </div>
                )}
                
                {activeTab === 'chapters' && (
                  <div>
                    {chaptersError && (
                      <div className="text-red-600 mb-4">
                        <p>Đã xảy ra lỗi khi tải danh sách chapter: {chaptersError}</p>
                      </div>
                    )}
                    
                    {chaptersLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      </div>
                    ) : (
                      <>
                        {(!chapters || chapters.length === 0) && !chaptersError && (
                          <div className="text-gray-600 text-center py-4">
                            <p>Chưa có chapter nào.</p>
                          </div>
                        )}
                        
                        {chapters && chapters.length > 0 && (
                          <div className="divide-y divide-gray-200">
                            {chapters.map((chapter) => (
                              <Link
                                key={chapter._id}
                                to={`/manga/${id}/chapter/${chapter.number}`}
                                className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">Chapter {chapter.number}</span>
                                  {chapter.title && (
                                    <span className="ml-2 text-gray-600">: {chapter.title}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;
