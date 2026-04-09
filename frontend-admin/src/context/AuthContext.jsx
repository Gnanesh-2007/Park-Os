import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user token
    const storedUser = localStorage.getItem('parkos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
    if (res.data) {
      setUser(res.data);
      localStorage.setItem('parkos_user', JSON.stringify(res.data));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, userData);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem('parkos_user', JSON.stringify(res.data));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkos_user');
  };

  // Axios interceptor for adding token
  axios.interceptors.request.use(
    config => {
      const storedUser = localStorage.getItem('parkos_user');
      if (storedUser) {
        const token = JSON.parse(storedUser).token;
        if (token) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
      }
      return config;
    },
    error => {
      Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
