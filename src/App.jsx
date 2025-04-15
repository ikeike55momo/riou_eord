import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import FacilitiesListPage from './pages/facilities/FacilitiesListPage'; 
import FacilityFormPage from './pages/facilities/FacilityFormPage';
import KeywordGenerationPage from './pages/keywords/KeywordGenerationPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/layout/Layout';

// 認証済みユーザーのみアクセス可能なルートのラッパー
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<FacilitiesListPage />} />
            <Route path="facilities/new" element={<FacilityFormPage />} />
            <Route path="facilities/:id" element={<FacilityFormPage />} />
            <Route path="facilities/:id/keywords" element={<KeywordGenerationPage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 