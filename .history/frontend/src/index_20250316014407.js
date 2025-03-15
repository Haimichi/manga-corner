import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Đăng ký Service Worker với xử lý lỗi tốt hơn
// serviceWorkerRegistration.register({
//   onUpdate: (registration) => {
//     // Hiển thị thông báo khi có bản cập nhật
//     if (window.confirm('Đã có phiên bản mới! Bạn có muốn tải lại trang để cập nhật?')) {
//       // Trước tiên, yêu cầu Service Worker mới chiếm quyền kiểm soát
//       if (registration && registration.waiting) {
//         registration.waiting.postMessage({ type: 'SKIP_WAITING' });
//       }
//       // Sau đó tải lại trang
//       window.location.reload();
//     }
//   },
//   onSuccess: () => {
//     console.log('Nội dung đã được lưu vào cache để sử dụng ngoại tuyến.');
//   },
//   onError: (error) => {
//     console.error('Lỗi đăng ký Service Worker:', error);
//   }
// });

// Đo lường hiệu suất
reportWebVitals(metrics => {
  // Chỉ gửi telemetry trong môi trường production
  if (process.env.NODE_ENV === 'production') {
    // Gửi telemetry tới Google Analytics hoặc một dịch vụ khác
    console.log('Metrics:', metrics);
  }
});