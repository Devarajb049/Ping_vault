import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Settings, ShieldCheck, LogOut, Copy, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutTrigger: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  isOpen,
  onClose,
  onLogoutTrigger,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !user) return null;

  const copyReceiverId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.receiverId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Invisible Overlay to close on click outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-12 w-72 rounded-2xl bg-slate-900/95 dark:bg-pvBg/95 border border-slate-800 dark:border-white/10 shadow-2xl backdrop-blur-2xl z-50 p-4 space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* User Details */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pvPrimary to-pvSecondary text-white flex items-center justify-center font-extrabold text-base shadow-md">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-100 dark:text-white truncate">
              {user.fullName}
            </h4>
            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
          </div>
        </div>

        {/* User ID Quick Copy */}
        <div
          onClick={copyReceiverId}
          className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 dark:border-white/10 hover:border-pvPrimary/50 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
              User ID
            </span>
            <span className="font-mono text-xs font-bold text-pvPrimary dark:text-pvSecondary">
              {user.receiverId}
            </span>
          </div>
          {copied ? (
            <Check className="w-4 h-4 text-pvSuccess animate-bounce" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-pvPrimary transition-colors" />
          )}
        </div>

        {/* Security Score Widget */}
        <div className="p-3 rounded-xl bg-pvPrimary/10 border border-pvPrimary/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-pvSuccess" />
            <span className="text-xs font-semibold text-slate-300">Security Index</span>
          </div>
          <span className="font-mono font-extrabold text-xs text-pvSuccess bg-pvSuccess/20 px-2 py-0.5 rounded-full border border-pvSuccess/40">
            {user.securityScore || 98}%
          </span>
        </div>

        {/* Quick Menu Links */}
        <div className="space-y-1 pt-1">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 dark:hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4 text-pvPrimary" />
            <span>Profile Account</span>
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 dark:hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4 text-pvPrimary" />
            <span>System Preferences</span>
          </Link>

          <button
            onClick={() => {
              toggleTheme();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
              <span>Theme Mode</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {theme}
            </span>
          </button>
        </div>

        {/* Sign out */}
        <div className="pt-2 border-t border-slate-800 dark:border-white/10">
          <button
            onClick={onLogoutTrigger}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-pvDanger hover:bg-pvDanger/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
