import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Đăng ký Service Worker nếu hỗ trợ
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // serviceWorkerRegistration.register(); // Comment lại để tránh lỗi
    console.log('Service Worker đã bị vô hiệu hóa để tránh lỗi.');

    // Hoặc nếu muốn xử lý lỗi một cách tốt hơn:
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker đăng ký thành công:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker đăng ký thất bại:', error);
      });
  });
}