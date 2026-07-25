import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { Copy, Check, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const copyReceiverId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-pvAccent/20 bg-pvDark/90 backdrop-blur-xl z-40 px-3 md:px-8 flex items-center justify-between shadow-lg">
        {/* Brand Logo Component */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
        >
          <BrandLogo size="md" variant="full" />
        </Link>

        {/* Receiver ID Pill & Profile */}
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User ID Quick Copy */}
            <div
              onClick={copyReceiverId}
              title="Click to copy your unique User ID"
              className="flex items-center space-x-1.5 sm:space-x-2 bg-pvDarker/80 border border-pvAccent/40 hover:border-pvAccent px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-inner group"
            >
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">User ID:</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-pvAccent tracking-wide">{user.receiverId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-pvSuccess animate-bounce" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-pvAccent transition-colors" />
              )}
            </div>

            {/* Profile & Desktop Logout */}
            <div className="flex items-center space-x-2 border-l border-pvAccent/20 pl-2 sm:pl-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-pvAccent/10 text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-pvPrimary/60 border border-pvAccent/40 flex items-center justify-center font-bold text-sm text-pvAccent">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden md:inline text-sm font-medium">{user.fullName}</span>
              </Link>

              {/* Hide logout icon on mobile viewports (< 768px) where bottom nav profile sheet handles logout */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out"
                className="hidden md:flex p-2 rounded-lg text-slate-400 hover:text-pvDanger hover:bg-pvDanger/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Prompt Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
