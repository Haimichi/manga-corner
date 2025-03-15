import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapterDetails, fetchChapterPages } from '../features/mangadex/mangadexSlice';

const ChapterRead = () => {
  const { mangaId, chapterId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { chapterDetails, chapterPages, loading } = useSelector(state => state.mangadex);
  const { chapters } = useSelector(state => state.mangadex);
  
  // Lấy dữ liệu chapter hiện tại
  const chapter = chapterDetails[chapterId];
  const pages = chapterPages[chapterId] || [];
  
  // Lấy danh sách chapter của manga này để điều hướng giữa các chapter
  const mangaChapters = chapters[mangaId]?.data || [];
  
  useEffect(() => {
    dispatch(fetchChapterDetails(chapterId));
    dispatch(fetchChapterPages(chapterId));
  }, [dispatch, chapterId]);
  
  // Hàm điều hướng đến chapter trước/sau
  const navigateToChapter = (direction) => {
    if (mangaChapters.length === 0) return;
    
    const currentIndex = mangaChapters.findIndex(ch => ch.id === chapterId);
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'prev') {
      targetIndex = currentIndex - 1;
    } else {
      targetIndex = currentIndex + 1;
    }
    
    if (targetIndex >= 0 && targetIndex < mangaChapters.length) {
      navigate(`/manga/${mangaId}/chapter/${mangaChapters[targetIndex].id}`);
    }
  };
  
  const getChapterTitle = () => {
    if (!chapter) return 'Đang tải...';
    return `Chương ${chapter.attributes.chapter || '?'}: ${chapter.attributes.title || 'Không có tiêu đề'}`;
  };
  
  if