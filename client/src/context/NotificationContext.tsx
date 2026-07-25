import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { getSocket } from '../socket/socket';
import { useLocation } from 'react-router-dom';

export interface AppNotification {
  _id: string;
  type: 'VAULT_RECEIVED' | 'VAULT_OPENED' | 'VAULT_EXPIRED' | 'SECURITY_ALERT';
  title: string;
  message: string;
  vaultId?: string;
  senderReceiverId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'danger' | 'info' | 'warning';
  senderUser?: string;
  actionPath?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toasts: ToastItem[];
  addToast: (title: string, message: string, type?: 'success' | 'danger' | 'info' | 'warning', actionPath?: string) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Automatically close drawer on ANY route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Request browser Web Push notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'danger' | 'info' | 'warning' = 'info',
    actionPath?: string
  ) => {
    const newToast: ToastItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      title,
      message,
      type,
      actionPath,
    };

    // Keep max 5 desktop / 3 mobile toasts stacked
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/v1/notifications');
      if (res.data.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Real-Time WebSockets Event Listener for Toast Alerts
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleVaultReceived = (data: any) => {
      fetchNotifications();
      addToast(
        '📩 New File Received',
        `Payload shared with you from ${data.senderReceiverId || 'Sender'}`,
        'success',
        '/received'
      );

      // Native Browser Web Push Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Ping Vault Alert 🔔', {
          body: `You received an encrypted vault payload from ${data.senderReceiverId}`,
          icon: '/favicon.svg',
        });
      }
    };

    const handleVaultDeleted = (data: any) => {
      fetchNotifications();
      addToast(
        '⚠ File Removed',
        data.message || 'A file shared with you has been removed by the sender.',
        'warning',
        '/received'
      );
    };

    socket.on('vault_received', handleVaultReceived);
    socket.on('vault_deleted', handleVaultDeleted);

    return () => {
      socket.off('vault_received', handleVaultReceived);
      socket.off('vault_deleted', handleVaultDeleted);
    };
  }, [user]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/v1/notifications/read-all');
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/v1/notifications/${id}`);
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).filter((n) => n._id !== id));
    } catch (e) {}
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: safeNotifications,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        toasts,
        addToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
