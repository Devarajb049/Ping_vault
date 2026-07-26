import React, { useEffect, useState } from 'react';
import { useNotifications, ToastItem } from '../context/NotificationContext';
import {
  Send,
  Mail,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Copy,
  Clock,
  LogOut,
  X,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getToastIcon = (type?: 'success' | 'danger' | 'info' | 'warning', title?: string) => {
  if (title?.includes('Sent') || title?.includes('Shared')) return Send;
  if (title?.includes('Received') || title?.includes('Ping')) return Mail;
  if (title?.includes('Deleted') || title?.includes('Removed')) return Trash2;
  if (title?.includes('Password') || title?.includes('Security')) return Lock;
  if (title?.includes('Copied') || title?.includes('Link')) return Copy;
  if (title?.includes('Logged Out')) return LogOut;

  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'danger':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    default:
      return Mail;
  }
};

const getToastBadgeColor = (type?: 'success' | 'danger' | 'info' | 'warning') => {
  switch (type) {
    case 'success':
      return 'bg-pvSuccess/20 border-pvSuccess/40 text-pvSuccess';
    case 'danger':
      return 'bg-pvDanger/20 border-pvDanger/40 text-pvDanger';
    case 'warning':
      return 'bg-pvWarning/20 border-pvWarning/40 text-pvWarning';
    default:
      return 'bg-pvAccent/20 border-pvAccent/40 text-pvAccent';
  }
};

const ToastSingle: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { dismissToast } = useNotifications();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, isHovered]);

  const IconComponent = getToastIcon(toast.type, toast.title);
  const badgeStyle = getToastBadgeColor(toast.type);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-live="polite"
      className="w-full max-w-sm rounded-2xl glass-panel border border-pvAccent/40 bg-pvDark/95 p-4 shadow-2xl space-y-3 animate-slide-in relative overflow-hidden group cursor-default select-none pointer-events-auto"
    >
      {/* Top Shrinking Timer Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pvAccent via-pvTeal to-pvPrimary ${!isHovered ? 'animate-shrink' : ''}`} />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${badgeStyle}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight font-poppins">{toast.title}</div>
            {toast.senderUser && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">From: {toast.senderUser}</div>
            )}
          </div>
        </div>

        <button
          onClick={() => dismissToast(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 font-inter leading-relaxed">{toast.message}</p>

      {toast.actionPath && (
        <button
          onClick={() => {
            dismissToast(toast.id);
            navigate(toast.actionPath!);
          }}
          className="w-full py-2 rounded-xl text-xs font-bold bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/30 flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { toasts } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 top-auto sm:top-20 sm:bottom-auto sm:right-6 sm:left-auto sm:translate-x-0 z-50 flex flex-col space-y-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-sm"
    >
      {toasts.map((toast) => (
        <ToastSingle key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

