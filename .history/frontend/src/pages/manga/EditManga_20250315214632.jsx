import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getMangaDetail, updateManga } from '../../features/manga/mangaSlice';

const genreOptions = [
  'Hành động', 'Phiêu lưu', 'Hài hước', 'Tình cảm', 'Học đường',
  'Võ thuật', 'Kinh dị', 'Giả tưởng', 'Khoa học viễn tưởng', 'Trinh thám',
  'Thể thao', 'Đời thường', 'Lịch sử', 'Shounen', 'Shoujo'
];

const EditManga = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { mangaDetail, loading, error } = useSelector((state) => state.manga);
  const { user } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    title: { vi: '', en: '' },
    alternativeTitles: [],
    description: { vi: '', en: '' },
    coverImage: '',
    genres: [],
    status: 'ongoing'
  });
  
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    if (id) {
      dispatch(getMangaDetail(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (mangaDetail) {
      setFormData({
        title: mangaDetail.title || { vi: '', en: '' },
        alternativeTitles: mangaDetail.alternativeTitles || [],
        description: mangaDetail.description || { vi: '', en: '' },
        coverImage: mangaDetail.coverImage || '',
        genres: mangaDetail.genres || [],
        status: mangaDetail.status || 'ongoing'
      });
    }
  }, [mangaDetail]);
  
  // Kiểm tra quyền chỉnh sửa
  useEffect(() => {
    if (mangaDetail && user) {
      const isCreator = mangaDetail.creator === user._id;
      const isTranslator = mangaDetail.translators?.includes(user._id);
      const isAdmin = user.role === 'admin';
      
      if (!isCreator && !isTranslator && !isAdmin) {
        setFormError('Bạn không có quyền chỉnh sửa truyện này');
      }
    }
  }, [mangaDetail, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'alternativeTitles') {
      setFormData({
        ...formData,
        alternativeTitles: value.split(',').map(title => title.trim())
      });
    } else if (name.includes('.')) {
      const [field, subfield] = name.split('.');
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [subfield]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleGenreChange = (e) => {
    const genre = e.target.value;
    
    if (e.target.checked) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genre]
      });
    } else {
      setFormData({
        ...formData,
        genres: formData.genres.filter(g => g !== genre)
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Đây là phần xử lý upload ảnh, bạn có thể sử dụng API hoặc cloud storage
      // Ở đây chúng ta giả lập tạo URL để preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          coverImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.genres.length === 0) {
      setFormError('Vui lòng chọn ít nhất một thể loại');
      return;
    }
    
    const result = await dispatch(updateManga({ id, mangaData: formData }));
    
    if (updateManga.fulfilled.match(result)) {
      navigate(`/manga/${id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (formError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-100 p-8 rounded-lg text-center">
          <p className="text-red-600 mb-4">{formError}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  if (!mangaDetail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin truyện.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Chỉnh sửa truyện</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title.vi">
                Tên truyện (Tiếng Việt) <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="title.vi"
                name="title.vi"
                type="text"
                placeholder="Nhập tên truyện bằng tiếng Việt"
                value={formData.title.vi}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title.en">
                Tên truyện (Tiếng Anh)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="title.en"
                name="title.en"
                type="text"
                placeholder="Nhập tên truyện bằng tiếng Anh (nếu có)"
                value={formData.title.en}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alternativeTitles">
                Tên khác (phân cách bằng dấu phẩy)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="alternativeTitles"
                name="alternativeTitles"
                type="text"
                placeholder="Các tên khác của truyện (nếu có)"
                value={formData.alternativeTitles.join(', ')}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description.vi">
                Mô tả (Tiếng Việt) <span className="text-red-500">*</span>
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="description.vi"
                name="description.vi"
                rows="5"
                placeholder="Nhập mô tả truyện bằng tiếng Việt"
                value={formData.description.vi}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description.en">
                Mô tả (Tiếng Anh)
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="description.en"
                name="description.en"
                rows="5"
                placeholder="Nhập mô tả truyện bằng tiếng Anh (nếu có)"
                value={formData.description.en}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="ongoing">Đang tiến hành</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="hiatus">Tạm ngưng</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Thể loại <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {genreOptions.map(genre => (
                  <div key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`genre-${genre}`}
                      value={genre}
                      checked={formData.genres.includes(genre)}
                      onChange={handleGenreChange}
                      className="mr-2"
                    />
                    <label htmlFor={`genre-${genre}`} className="text-sm">{genre}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="coverImage">
                Ảnh bìa hiện tại
              </label>
              
              {formData.coverImage && (
                <div className="mb-4">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover" 
                    className="w-full max-w-xs object-cover rounded"
                  />
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newCoverImage">
                  Thay đổi ảnh bìa
                </label>
                <input
                  type="file"
                  id="newCoverImage"
                  name="newCoverImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditManga;
