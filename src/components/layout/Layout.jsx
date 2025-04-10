import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={currentUser} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
