// Helper để lấy URL ảnh bìa manga
export const getImageUrl = (mangaId, fileName) => {
    if (!mangaId || !fileName) {
      return "https://placehold.co/400x600/374151/FFFFFF?text=Không+có+ảnh";
    }
    
    // URL MangaDex CDN
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };
  
  // Tối ưu load ảnh với lazy loading
  export const lazyLoadImage = (src, fallbackSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = () => {
        console.warn(`Không thể tải ảnh: ${src}, sử dụng fallback`);
        resolve(fallbackSrc);
      };
    });
  };
  
  // Tạo URL Placeholder
  export const createPlaceholder = (width, height, text) => {
    return `https://placehold.co/${width}x${height}/374151/FFFFFF?text=${encodeURIComponent(text || 'Manga+Corner')}`;
  };