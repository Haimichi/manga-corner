import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMangadexDetails } from '../features/mangadex/mangadexSlice';

const MangaDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentManga, loading, error } = useSelector((state) => ({
    currentManga: state.mangadex.currentManga,
    loading: state.mangadex.loading.details,
    error: state.mangadex.error.details
  }));

  useEffect(() => {
    if (id) {
      dispatch(fetchMangadexDetails(id));
    }
  }, [dispatch, id]);

  // Hàm helper lấy URL ảnh bìa manga
  const getCoverImage = (manga) => {
    if (!manga) return 'https://via.placeholder.com/400x600?text=No+Cover';
    
    const coverRelationship = manga.relationships?.find(rel => rel.type === 'cover_art');
    const fileName = coverRelationship?.attributes?.fileName;
    
    if (fileName) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`;
    }
    return 'https://via.placeholder.com/400x600?text=No+Cover';
  };

  // Hàm helper lấy tiêu đề manga
  const getMangaTitle = (manga) => {
    if (!manga?.attributes?.title) return 'Không có tiêu đề';
    
    const titles = manga.attributes.title;
    return titles.vi || titles.en || Object.values(titles)[0] || 'Không có tiêu đề';
  };

  // Hàm helper lấy mô tả manga
  const getMangaDescription = (manga) => {
    if (!manga?.attributes?.description) return 'Không có mô tả';
    
    const descriptions = manga.attributes.description;
    return descriptions.vi || descriptions.en || Object.values(descriptions)[0] || 'Không có mô tả';
  };

  // Hàm helper lấy tên tác giả
  const getAuthorName = (manga) => {
    if (!manga || !manga.relationships) return 'Không rõ';
    
    const authorRel = manga.relationships.find(rel => rel.type === 'author');
    return authorRel?.attributes?.name || 'Không rõ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-red-100 rounded-md my-8">
        <h2 className="text-xl font-bold text-red-700 mb-2">Lỗi</h2>
        <p className="text-red-700">{error}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  if (!currentManga) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-gray-700">Đang tải thông tin manga...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-64">
          <img
            src={getCoverImage(currentManga)}
            alt={getMangaTitle(currentManga)}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
          
          <div className="mt-4 space-y-2">
            <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Đọc từ đầu
            </button>
            <button className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Theo dõi
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{getMangaTitle(currentManga)}</h1>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {currentManga.attributes.tags?.map(tag => (
                <span key={tag.id} className="px-2 py-1 bg-gray-200 text-sm rounded-md">
                  {tag.attributes.name.vi || tag.attributes.name.en}
                </span>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Tác giả</p>
                <p className="font-medium">{getAuthorName(currentManga)}</p>
              </div>
              <div>
                <p className="text-gray-600">Trạng thái</p>
                <p className="font-medium">
                  {currentManga.attributes.status === 'ongoing' ? 'Đang cập nhật' : 
                   currentManga.attributes.status === 'completed' ? 'Hoàn thành' : 
                   currentManga.attributes.status}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Giới thiệu</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: getMangaDescription(currentManga).replace(/\n/g, '<br/>') }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Danh sách chapter</h2>
        <div className="bg-gray-100 p-8 rounded-md text-center text-gray-500">
          Đang phát triển tính năng này...
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;