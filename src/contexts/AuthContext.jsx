import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ログイン処理
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.auth.login({ email, password });
      if (response.data.token && response.data.user) {
          const { token, user } = response.data;
          localStorage.setItem('authToken', token);
          localStorage.setItem('userName', user.name)
          setCurrentUser(prev => ({
            ...prev,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }));
          setIsAuthenticated(true);
          return true;
        } else {
          setError("認証情報の取得に失敗しました");
          return false;
      }
    } catch (err) {
      console.log(err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'ログインに失敗しました。認証情報を確認してください';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
    
  };

  // ログアウト処理
  const logout = () => {
    api.auth.logout()
      .then(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
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
              const userName = localStorage.getItem('userName');
              setCurrentUser(prev => ({
                ...prev,
                id: response.data.user.id,
                name: userName,
                email: response.data.user.email,
                role: response.data.user.role
              }));
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
    isLoading,
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