import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Copy, Check, X, AlertTriangle } from 'lucide-react';

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const copyReceiverId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNavigateProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-pvDarker/80 backdrop-blur-md animate-fade-in p-0 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-pvDark/95 border border-pvAccent/40 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-slide-in cursor-default"
      >
        {/* Mobile Swipe Handle Indicator */}
        <div className="w-12 h-1.5 bg-pvAccent/30 rounded-full mx-auto sm:hidden" />

        {/* User Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-pvPrimary/60 border border-pvAccent/50 flex items-center justify-center font-bold text-lg text-pvAccent shadow-glow-primary">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-poppins font-bold text-lg text-white leading-tight">{user?.fullName}</h3>
              <div
                onClick={copyReceiverId}
                className="flex items-center space-x-1.5 text-xs text-pvAccent font-mono mt-0.5 cursor-pointer hover:underline"
              >
                <span>ID: {user?.receiverId}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-pvSuccess" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items: View Profile & Logout */}
        <div className="space-y-2 pt-2 border-t border-pvAccent/20">
          <button
            onClick={handleNavigateProfile}
            className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-slate-200 hover:text-white hover:bg-pvAccent/15 transition-all text-sm font-semibold text-left"
          >
            <User className="w-5 h-5 text-pvAccent" />
            <span>View Profile</span>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-pvDanger hover:bg-pvDanger/10 transition-all text-sm font-bold text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md"
        >
          <div className="w-full max-w-sm rounded-3xl glass-panel border border-pvDanger/40 bg-pvDark/95 p-6 space-y-6 shadow-2xl text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-pvDanger/20 border border-pvDanger/40 flex items-center justify-center text-pvDanger mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-poppins font-bold text-xl text-white">Logout?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to log out of your PingVault session?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 rounded-xl font-bold text-xs bg-pvDarker border border-pvAccent/30 text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmLogout}
                className="py-2.5 rounded-xl font-bold text-xs bg-pvDanger text-white hover:opacity-90 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
