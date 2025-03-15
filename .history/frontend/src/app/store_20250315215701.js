import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mangaReducer from '../features/manga/mangaSlice';
import userReducer from '../features/user/userSlice';
import chapterReducer from '../features/chapter/chapterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manga: mangaReducer,
    user: userReducer,
    chapter: chapterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});