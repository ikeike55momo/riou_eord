import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow-sm w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              キーワード自動提案
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/facilities" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/facilities')}`}>
              施設一覧
            </Link>
            <Link to="/keywords" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/keywords')}`}>
              キーワード管理
            </Link>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <div className="ml-3 relative flex items-center">
              {/* <div className="text-sm mr-4"> */}
                  {/* <span className="text-gray-700">{user.email}</span> */}
              {/* </div> */}
              <button onClick={handleLogout} className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200">
                ログアウト
              </button>
                </div>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
