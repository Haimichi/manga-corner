import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MangaCard = ({ manga }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  
  // Đảm bảo manga hợp lệ
  if (!manga || !manga.id) {
    console.error("MangaCard nhận được manga không hợp lệ:", manga);
    return null;
  }
  
  // Hàm lấy ảnh bìa an toàn
  const getCoverImage = () => {
    try {
      if (!manga.relationships) return '/images/default-cover.jpg';
      
      const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
      
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return '/images/default-cover.jpg';
      }
      
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (error) {
      console.error("Lỗi khi lấy ảnh bìa cho manga:", manga.id, error);
      return '/images/default-cover.jpg';
    }
  };
  
  // Hàm lấy tiêu đề an toàn
  const getTitle = () => {
    try {
      if (!manga.attributes || !manga.attributes.title) return 'Không có tiêu đề';
      
      const { title } = manga.attributes;
      return title.vi || title.en || Object.values(title)[0] || 'Không có tiêu đề';
    } catch (error) {
      console.error("Lỗi khi lấy tiêu đề cho manga:", manga.id, error);
      return 'Không có tiêu đề';
    }
  };
  
  const coverImage = getCoverImage();
  const title = getTitle();
  
  // Sử dụng Intersection Observer để lazy-load hình ảnh
  useEffect(() => {
    // Tạo observer mới để theo dõi khi nào card được hiển thị trong viewport
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Khi card hiển thị trong viewport, tải hình ảnh
          const img = new Image();
          img.src = coverImage;
          img.onload = () => setImageLoaded(true);
          img.onerror = () => setImageError(true);
          
          // Ngừng theo dõi sau khi đã bắt đầu tải
          observerRef.current.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // Bắt đầu tải khi còn cách 200px
    );
    
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [coverImage]);
  
  // Kiểm tra có tag mới cập nhật không
  const isUpdatedRecently = () => {
    try {
      if (!manga.attributes || !manga.attributes.updatedAt) return false;
      
      const updatedAt = new Date(manga.attributes.updatedAt);
      const now = new Date();
      const diffTime = Math.abs(now - updatedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays