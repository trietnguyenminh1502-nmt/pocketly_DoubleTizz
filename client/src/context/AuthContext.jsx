import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pocketly_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Khởi tạo kiểm tra session khi load trang
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pocketly_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('pocketly_user', JSON.stringify(res.data.user));
          }
        } catch {
          setUser(null);
          localStorage.removeItem('pocketly_access_token');
          localStorage.removeItem('pocketly_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, accessToken } = res.data;

    localStorage.setItem('pocketly_access_token', accessToken);
    localStorage.setItem('pocketly_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    return await authApi.register(formData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('pocketly_access_token');
      localStorage.removeItem('pocketly_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateUserState = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('pocketly_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateUserState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
