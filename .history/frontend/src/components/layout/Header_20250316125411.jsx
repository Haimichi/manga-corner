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
  const [scrolled, setScrolled] = useState(false);
  const [localAuth, setLocalAuth] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // Theo dõi sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Tạo avatar khi đã đăng nhập
    if (isAuthenticated && user) {
      const seed = user?.username || Math.random().toString(36).substring(7);
      setAvatar(`https://api.dicebear.com/7.x/anime/svg?seed=${seed}`);
    }
  }, [isAuthenticated, user]);

  // Thêm useEffect để kiểm tra auth khi component mount
  useEffect(() => {
    // Tự động check khi load trang
    const token = localStorage.getItem('token');
    // Debug để xem token và trạng thái đăng nhập
    console.log("Token:", token, "isAuthenticated:", isAuthenticated);
    
    if (token && !isAuthenticated) {
      console.log("Dispatching checkAuth...");
      dispatch(checkAuth());
    }
    
    // Nếu có user trong localStorage nhưng chưa có trong Redux state
    const userStr = localStorage.getItem('user');
    if (userStr && !user) {
      try {
        console.log("Found user in localStorage");
        const userData = JSON.parse(userStr);
        // Cần có action để cập nhật user state
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Kiểm tra localStorage trực tiếp
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      setLocalAuth(true);
      if (userStr) {
        try {
          setLocalUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Error parsing user", e);
        }
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/');
      });
  };

  return (
    <nav 
      className={`${
        scrolled 
          ? 'bg-purple-900 sticky top-0 shadow-lg' 
          : 'bg-transparent absolute w-full'
      } transition-all duration-300 z-50`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Menu bên trái */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-pink-200 px-3 py-2 text-sm font-medium uppercase">
              Trang chủ
            </Link>
            <Link to="/rankings" className="text-white hover:text-pink-200 px-3 py-2 text-sm font-medium uppercase">
              Bảng xếp hạng
            </Link>
            <Link to="/news" className="text-white hover:text-pink-200 px-3 py-2 text-sm font-medium uppercase">
              Tin tức
            </Link>
          </div>

          {/* Logo ở giữa */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="text-white font-bold text-2xl flex items-center">
              <svg className="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
              </svg>
              MANGA CORNER
            </Link>
          </div>

          {/* Menu bên phải */}
          <div className="flex items-center space-x-3">
            {/* Form tìm kiếm */}
            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm truyện..."
                  className={`${
                    scrolled ? 'bg-purple-800' : 'bg-black bg-opacity-40'
                  } text-white w-48 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white text-sm transition-colors duration-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <SearchIcon className="h-5 w-5 text-gray-300" />
                </button>
              </form>
            </div>

            {/* Thông báo */}
            <button className="text-white hover:text-pink-200 p-1 rounded-full relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User menu */}
            {isAuthenticated && user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex text-sm rounded-full">
                  <img
                    className="h-8 w-8 rounded-full object-cover border-2 border-white"
                    src={avatar}
                    alt={user?.username || 'Người dùng'}
                  />
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
                    {((user?.role === 'translator') || (localUser?.role === 'translator')) && (
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
                    {((user?.role === 'admin') || (localUser?.role === 'admin')) && (
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
                  className="text-white hover:text-pink-200 px-3 py-2 text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-600 text-white hover:bg-pink-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Menu di động */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-pink-200"
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
        <div className={`md:hidden ${scrolled ? 'bg-purple-900' : 'bg-black bg-opacity-75'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-800">
            <Link
              to="/"
              className="text-white hover:text-pink-200 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/rankings"
              className="text-white hover:text-pink-200 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng xếp hạng
            </Link>
            <Link
              to="/news"
              className="text-white hover:text-pink-200 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Tin tức
            </Link>

            <form onSubmit={handleSearch} className="relative mt-3">
              <input
                type="text"
                placeholder="Tìm kiếm truyện..."
                className={`${
                  scrolled ? 'bg-purple-800' : 'bg-black bg-opacity-40'
                } text-white w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-300`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                <SearchIcon className="h-5 w-5 text-gray-300" />
              </button>
            </form>
          </div>

          {!isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-purple-800">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Link
                    to="/login"
                    className="text-white hover:text-pink-200 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>
                <div className="ml-3">
                  <Link
                    to="/register"
                    className="bg-pink-600 text-white hover:bg-pink-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-purple-800">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={avatar}
                    alt={(user?.username || localUser?.username) || 'User'}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{(user?.username || localUser?.username)}</div>
                  <div className="text-sm font-medium leading-none text-gray-300 mt-1">{(user?.email || localUser?.email)}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-pink-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/reading-history"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-pink-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lịch sử đọc
                </Link>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-pink-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Truyện yêu thích
                </Link>
                
                {((user?.role === 'translator') || (localUser?.role === 'translator')) && (
                  <Link
                    to="/translator/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-pink-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản lý truyện
                  </Link>
                )}
                
                {((user?.role === 'admin') || (localUser?.role === 'admin')) && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-pink-200"
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
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300"
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