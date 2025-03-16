import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon as SearchIcon, BellIcon, TrophyIcon, UsersIcon, NewspaperIcon, Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    // Nếu đã đăng nhập, tạo avatar anime ngẫu nhiên
    if (isAuthenticated) {
      // Tạo số ngẫu nhiên để lấy avatar khác nhau mỗi lần
      const randomNumber = Math.floor(Math.random() * 100);
      setAvatar(`https://api.dicebear.com/7.x/anime/svg?seed=${user?.username || randomNumber}`);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo và menu chính */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl flex items-center">
                <svg className="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                </svg>
                MANGA CORNER
              </Link>
            </div>
            <div className="hidden md:block md:ml-6">
              <div className="flex space-x-4">
                <Link to="/" className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  TRANG CHỦ
                </Link>
                <Menu as="div" className="relative">
                  <Menu.Button className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <TrophyIcon className="h-5 w-5 mr-1" />
                    Bảng xếp hạng
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/rankings/translators"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            <UsersIcon className="h-5 w-5 inline mr-1" />
                            Nhóm dịch
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/rankings/users"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            <UsersIcon className="h-5 w-5 inline mr-1" />
                            Người dùng
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/rankings/manga"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            <TrophyIcon className="h-5 w-5 inline mr-1" />
                            Truyện đọc nhiều
                          </Link>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                <Link to="/news" className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <NewspaperIcon className="h-5 w-5 mr-1" />
                  Tin tức
                </Link>
                <Link to="/manga/latest" className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Mới cập nhật
                </Link>
                <Link to="/manga/popular" className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Phổ biến
                </Link>
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm và Menu user */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm truyện..."
                  className="bg-indigo-800 text-white w-64 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </div>

            {/* Thông báo */}
            <button className="text-gray-300 hover:text-white p-1 rounded-full relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-white"
                      src={avatar}
                      alt={user?.username || 'User'}
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                        >
                          Hồ sơ cá nhân
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/reading-history"
                          className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                        >
                          Lịch sử đọc
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/favorites"
                          className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                        >
                          Truyện yêu thích
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Menu cho dịch giả */}
                    {user?.role === 'translator' && (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/translator/dashboard"
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Quản lý truyện
                            </Link>
                          )}
                        </Menu.Item>
                      </>
                    )}

                    {/* Menu cho admin */}
                    {user?.role === 'admin' && (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin/dashboard"
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Trang quản trị
                            </Link>
                          )}
                        </Menu.Item>
                      </>
                    )}

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-red-600`}
                        >
                          Đăng xuất
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-indigo-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Menu di động */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMenuOpen ? (
                  <XIcon className="block h-6 w-6" />
                ) : (
                  <MenuIcon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu di động mở rộng */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/rankings/translators"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng xếp hạng nhóm dịch
            </Link>
            <Link
              to="/rankings/users"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng xếp hạng người dùng
            </Link>
            <Link
              to="/news"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Tin tức
            </Link>
            <Link
              to="/manga/latest"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Mới cập nhật
            </Link>
            <Link
              to="/manga/popular"
              className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Phổ biến
            </Link>

            <form onSubmit={handleSearch} className="relative mt-3">
              <input
                type="text"
                placeholder="Tìm kiếm truyện..."
                className="bg-indigo-800 text-white w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </button>
            </form>
          </div>

          {!isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-indigo-800">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:bg-indigo-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>
                <div className="ml-3">
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-indigo-800">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={avatar}
                    alt={user?.username || 'User'}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user?.username}</div>
                  <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-indigo-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/reading-history"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-indigo-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lịch sử đọc
                </Link>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-indigo-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Truyện yêu thích
                </Link>
                
                {user?.role === 'translator' && (
                  <Link
                    to="/translator/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-indigo-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản lý truyện
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-indigo-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Trang quản trị
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-indigo-800"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;