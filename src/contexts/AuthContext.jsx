import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ログイン処理
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.auth.login({ email, password });
      
      if (response.data.user) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.data.token);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const logout = () => {
    api.auth.logout()
      .then(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      })
      .catch(err => {
        console.error('ログアウトエラー:', err);
      });
  };

  // 認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await api.auth.getProfile();
          
          if (response.data.user) {
            setCurrentUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 