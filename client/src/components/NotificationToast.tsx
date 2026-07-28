import React, { useEffect, useState } from 'react';
import { useNotifications, ToastItem } from '../context/NotificationContext';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SingleToast: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { dismissToast } = useNotifications();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          dismissToast(toast.id);
          return 0;
        }
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, toast.id, dismissToast]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-pvSuccess" />,
    danger: <AlertCircle className="w-5 h-5 text-pvDanger" />,
    warning: <AlertTriangle className="w-5 h-5 text-pvWarning" />,
    info: <Info className="w-5 h-5 text-pvPrimary" />,
  };

  const currentIcon = icons[toast.type || 'info'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden w-full max-w-sm p-4 rounded-2xl bg-slate-900/95 dark:bg-pvBg/95 border border-slate-800 dark:border-white/10 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 text-slate-100"
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5 flex-shrink-0">{currentIcon}</div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold leading-snug">{toast.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{toast.message}</p>
          {toast.actionPath && (
            <button
              onClick={() => {
                dismissToast(toast.id);
                navigate(toast.actionPath!);
              }}
              className="mt-1 text-[11px] font-bold text-pvPrimary hover:underline flex items-center space-x-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => dismissToast(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className="h-full bg-pvPrimary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { toasts } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <SingleToast toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
