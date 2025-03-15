import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mangaReducer from '../features/manga/mangaSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manga: mangaReducer,
    user: userReducer,
  },
});
