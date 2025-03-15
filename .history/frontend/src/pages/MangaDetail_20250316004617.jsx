          const publishDate = new Date(chapter.attributes.publishAt);
          const now = new Date();
          const diffTime = Math.abs(now - publishDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          
          let timeAgo;
          if (diffDays > 30) {
            const diffMonths = Math.floor(diffDays / 30);
            timeAgo = `${diffMonths} tháng trước`;
          } else if (diffDays > 0) {
            timeAgo = `${diffDays} ngày trước`;
    } else {
            timeAgo = `${diffHours} giờ trước`;
          }
          
          // Lấy cờ quốc gia dựa vào ngôn ngữ
          const languageFlag = chapter.attributes.translatedLanguage === 'vi' 
            ? '🇻🇳' 
            : chapter.attributes.translatedLanguage === 'en' 
              ? '🇬🇧' 
              : '🌐';
          
          // Xác định tiêu đề chapter
          const chapterNumber = chapter.attributes.chapter 
            ? `Ch. ${chapter.attributes.chapter}` 
            : 'Oneshot';
          const chapterTitle = chapter.attributes.title || chapterNumber;
          
          return (
            <div 
              key={chapter.id} 
              className="bg-gray-800 hover:bg-gray-700 transition-colors py-3 px-4 rounded flex flex-col md:flex-row items-start md:items-center"
            >
              <div className="flex-1 min-w-0">
                {/* Header với icon, số chapter và ngôn ngữ */}
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="text-gray-400 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <span className="inline-flex items-center mr-2">
                    <span className="mr-1">{languageFlag}</span>
                    <a href={`/manga/${mangaId}/chapter/${chapter.id}`} className="text-white hover:text-blue-400 font-medium truncate">
                      {chapterTitle}
                    </a>
                  </span>
                </div>
                
                {/* Thông tin nhóm dịch */}
                <div className="flex items-center text-sm text-gray-400 mt-1 md:mt-0">
                  <div className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="truncate">{groupName}</span>
                </div>
              </div>
              
              {/* Phần bên phải - thời gian và uploader */}
              <div className="flex flex-col items-end text-sm mt-2 md:mt-0">
                {/* Thời gian đăng */}
                <div className="flex items-center text-gray-400 mb-1 md:mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{timeAgo}</span>
                </div>
                
                {/* Người đăng */}
                <div className="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-400 hover:underline">{uploaderName}</span>
                </div>
                
                {/* Số lượt đọc (nếu có) */}
                <div className="flex items-center text-gray-400 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>N/A</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (localLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Đang tải thông tin manga...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }
  
  if (!manga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin manga</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manga này có thể không tồn tại hoặc đã bị xóa.
          </p>
          <a 
            href="/" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }
  
  const title = getTitle(manga);
  const description = getDescription(manga);
  const status = manga.attributes?.status || 'unknown';
  const coverImage = getCoverImage(manga);
  const authors = getAuthors(manga);
  
  // Map trạng thái thành tiếng Việt
  const statusMap = {
    ongoing: 'Đang tiến hành',
    completed: 'Hoàn thành',
    hiatus: 'Tạm ngừng',
    cancelled: 'Đã hủy',
    unknown: 'Không xác định'
  };
  
  return (
    <div>
      {/* Hero section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }}></div>
        <div className="container mx-auto h-full flex items-end px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end pb-6 md:pb-8 md:space-x-6">
            <div className="w-32 md:w-48 h-auto -mt-16 md:-mt-32 rounded-lg shadow-xl overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800">
              <img 
                src={coverImage} 
                alt={title} 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="mt-4 md:mt-0">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h1>
              <div className="flex flex-wrap items-center mb-1">
                {authors.map((author, index) => (
                  <span key={index} className="text-gray-200 mr-2">
                    {author}{index < authors.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap mt-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium mr-2 mb-2">
                  {statusMap[status] || statusMap.unknown}
                </span>
                {manga.attributes?.year && (
                  <span className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium mr-2 mb-2">
                    {manga.attributes.year}
                  </span>
                )}
                {/* Thể loại */}
                {manga.attributes?.tags?.filter(tag => tag.type === 'tag').map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm font-medium mr-2 mb-2">
                    {tag.attributes?.name?.vi || tag.attributes?.name?.en || ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Thông tin</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
                  <span className="ml-2">{statusMap[status] || statusMap.unknown}</span>
                </div>
                
                {manga.attributes?.year && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Năm phát hành:</span>
                    <span className="ml-2">{manga.attributes.year}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tác giả:</span>
                  <div className="mt-1">
                    {authors.length > 0 ? authors.map((author, index) => (
                      <div key={index} className="text-gray-600 dark:text-gray-400">{author}</div>
                    )) : (
                      <div className="text-gray-600 dark:text-gray-400">Không rõ tác giả</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Tóm tắt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">Tóm tắt</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
            
            {/* Danh sách chapter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Danh sách chapter</h2>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  className={`py-3 px-6 font-medium border-b-2 transition flex items-center ${
                    activeTab === 'vi'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('vi')}
                >
                  <span className="mr-2">🇻🇳</span>
                  Tiếng Việt ({vietnameseChapters.length})
                </button>
                <button
                  className={`py-3 px-6 font-medium border-b-2 transition flex items-center ${
                    activeTab === 'en'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('en')}
                >
                  <span className="mr-2">🇬🇧</span>
                  Tiếng Anh ({englishChapters.length})
                </button>
              </div>
              
              {/* Hiển thị chapters */}
              {renderChapterList()}
              
              {/* Phân trang */}
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail; 