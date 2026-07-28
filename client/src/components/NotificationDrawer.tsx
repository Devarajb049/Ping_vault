import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { X, Bell, CheckCheck, Trash2, ShieldAlert, FolderLock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isDrawerOpen) return null;

  const filtered = notifications.filter((n) => (activeTab === 'unread' ? !n.isRead : true));

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 dark:bg-pvBg border-l border-slate-800 dark:border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-pvPrimary" />
              <h2 className="font-bold text-lg text-slate-100 dark:text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pvPrimary/20 text-pvPrimary text-xs font-bold border border-pvPrimary/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-pvPrimary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'unread'
                    ? 'bg-pvPrimary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-pvPrimary hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-400">No notifications to display</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isRead
                      ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                      : 'bg-slate-850 dark:bg-white/5 border-pvPrimary/30 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-pvPrimary/15 border border-pvPrimary/30 flex items-center justify-center text-pvPrimary flex-shrink-0 mt-0.5">
                        {item.type === 'SECURITY_ALERT' ? (
                          <ShieldAlert className="w-4 h-4 text-pvDanger" />
                        ) : (
                          <FolderLock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-100 dark:text-white leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono inline-block">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!item.isRead && (
                        <button
                          onClick={() => markAsRead(item._id)}
                          title="Mark as read"
                          className="p-1 rounded-lg text-slate-400 hover:text-pvPrimary hover:bg-slate-800"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(item._id)}
                        title="Delete notification"
                        className="p-1 rounded-lg text-slate-400 hover:text-pvDanger hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.vaultId && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-end">
                      <Link
                        to="/received"
                        onClick={() => setIsDrawerOpen(false)}
                        className="text-[11px] font-bold text-pvPrimary hover:underline flex items-center space-x-1"
                      >
                        <span>View Vault Payload</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
