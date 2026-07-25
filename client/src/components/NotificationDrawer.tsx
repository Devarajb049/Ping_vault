import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X, CheckCheck, Trash2, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isDrawerOpen,
    setIsDrawerOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'shared' | 'system'>('all');

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'shared') return n.type === 'VAULT_RECEIVED' || n.type === 'VAULT_OPENED';
    if (filter === 'system') return n.type === 'SECURITY_ALERT' || n.type === 'VAULT_EXPIRED';
    return true;
  });

  return (
    <div
      onClick={() => setIsDrawerOpen(false)}
      className="fixed inset-0 z-50 flex justify-end bg-pvDarker/70 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-pvDark/95 border-l border-pvAccent/30 p-6 flex flex-col justify-between shadow-2xl space-y-6 relative overflow-hidden cursor-default"
      >
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-pvAccent/20 border border-pvAccent/40 flex items-center justify-center text-pvAccent">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl text-white">Notifications</h3>
                <p className="text-xs text-slate-400">Real-time Ping alerts & activity history</p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Notifications"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-pvAccent/20">
            <button
              onClick={markAllAsRead}
              className="text-pvAccent hover:underline flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 border-b border-pvAccent/20 pb-2">
            {(['all', 'unread', 'shared', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  filter === tab
                    ? 'bg-pvAccent/20 text-pvAccent border border-pvAccent/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-4 rounded-2xl border transition-all space-y-2 relative cursor-pointer ${
                !n.isRead
                  ? 'bg-pvAccent/10 border-pvAccent/40 shadow-glow-primary'
                  : 'bg-pvDarker/80 border-pvAccent/20 opacity-80'
              }`}
            >
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-pvDanger absolute top-3 right-3 animate-ping" />
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-pvAccent" />
                  <span className="text-xs font-bold text-white">{n.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n._id);
                  }}
                  className="text-slate-500 hover:text-pvDanger p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                {n.vaultId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDrawerOpen(false);
                      navigate('/received');
                    }}
                    className="text-pvAccent font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>View Payload</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              No notifications found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
