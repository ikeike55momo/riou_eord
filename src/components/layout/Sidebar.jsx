import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BuildingOfficeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <aside className="w-64 bg-white shadow-sm h-screen">
      <div className="px-4 py-6">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className={`flex items-center px-4 py-3 rounded-md ${isActive('/')}`}
            >
              <HomeIcon className="h-5 w-5 mr-3" />
              <span>施設一覧</span>
            </Link>
          </li>
          <li>
            <Link
              to="/facilities/new"
              className={`flex items-center px-4 py-3 rounded-md ${isActive('/facilities/new')}`}
            >
              <BuildingOfficeIcon className="h-5 w-5 mr-3" />
              <span>新規施設登録</span>
            </Link>
          </li>
          <li className="border-t border-gray-200 pt-2 mt-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ヘルプ
            </div>
            <a
              href="#"
              className="flex items-center px-4 py-3 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                // ヘルプドキュメントを表示する処理
              }}
            >
              <DocumentTextIcon className="h-5 w-5 mr-3" />
              <span>使い方ガイド</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
