import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">キーワード自動提案</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="ml-3 relative flex items-center">
                <div className="text-sm mr-4">
                  <span className="text-gray-700">{user.email}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
