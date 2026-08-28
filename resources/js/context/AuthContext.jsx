import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../bootstrap';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/me');
      setUser(res.data.user);
      if (res.data.user) {
        fetchNotifications();
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      // ignore
    }
  };

  const markNotificationRead = async (id = null) => {
    try {
      await axios.post(id ? `/api/notifications/read/${id}` : '/api/notifications/read');
      fetchNotifications();
    } catch (e) {}
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/login', { email, password });
    setUser(res.data.user);
    fetchNotifications();
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post('/api/register', data);
    setUser(res.data.user);
    fetchNotifications();
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (e) {
      // Ignore network / rate limiting errors on logout to allow clean client-side exit
    } finally {
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        notifications,
        unreadCount,
        refreshUser: fetchCurrentUser,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
