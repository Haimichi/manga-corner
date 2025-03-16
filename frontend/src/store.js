import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import userReducer from './features/user/userSlice';
// Các reducer khác...

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    // Các reducer khác...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Nếu bạn cần export mặc định, thêm dòng này
// export default store; 