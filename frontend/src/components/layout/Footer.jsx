import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">MangaCorner</h3>
            <p className="text-gray-400 text-sm">
              Nền tảng đọc manga trực tuyến với kho truyện đa dạng và cập nhật nhanh chóng.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Trang chủ</Link>
              </li>
              <li>
                <Link to="/latest" className="text-gray-400 hover:text-white">Mới cập nhật</Link>
              </li>
              <li>
                <Link to="/popular" className="text-gray-400 hover:text-white">Phổ biến</Link>
              </li>
              <li>
                <Link to="/genres" className="text-gray-400 hover:text-white">Thể loại</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">Liên hệ</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">Chính sách riêng tư</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Kết nối</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="https://discord.com" className="text-gray-400 hover:text-white">
                <span className="sr-only">Discord</span>
                <i className="fab fa-discord text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MangaCorner. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
