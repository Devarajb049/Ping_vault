import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { NotificationDrawer } from './NotificationDrawer';
import { ProfileMenuModal } from './ProfileMenuModal';
import { Copy, Check, Bell, Search, Sun, Moon, LogOut, ShieldCheck, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { unreadCount, isDrawerOpen, setIsDrawerOpen } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-800/60 dark:border-white/10 bg-slate-950/80 dark:bg-pvBg/80 backdrop-blur-2xl z-40 px-3 md:px-6 flex items-center justify-between transition-colors">
        {/* Left Side: Brand Logo & Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <BrandLogo size="md" variant="full" />
          </Link>

          {user && setSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors hidden md:flex"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {sidebarOpen ? <ChevronsLeft className="w-5 h-5 text-pvPrimary" /> : <ChevronsRight className="w-5 h-5 text-pvPrimary" />}
            </button>
          )}
        </div>

        {/* Right Side: Actions & Profile */}
        {user && (
          <div className="flex items-center space-x-2.5">
            {/* User ID Quick Copy Pill */}
            <button
              type="button"
              onClick={copyReceiverId}
              title="Click to copy your unique User ID"
              className="hidden sm:flex items-center space-x-1.5 bg-slate-900/90 dark:bg-white/5 border border-pvPrimary/40 hover:border-pvPrimary px-2.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-inner group"
            >
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">ID:</span>
              <span className="font-mono text-xs font-bold text-pvPrimary dark:text-pvSecondary tracking-wide">
                {user.receiverId}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-pvSuccess animate-bounce" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-pvPrimary transition-colors" />
              )}
            </button>

            {/* Notification Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pvDanger text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>



            {/* User Avatar & Dropdown */}
            <div className="relative border-l border-slate-800 dark:border-white/10 pl-2.5">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-800/50 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pvPrimary to-pvSecondary text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-200">
                  {user.fullName}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <ProfileMenuModal
                  isOpen={showProfileMenu}
                  onClose={() => setShowProfileMenu(false)}
                  onLogoutTrigger={() => {
                    setShowProfileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                />
              )}
            </div>

            {/* Desktop Logout Quick Action */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign Out"
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-pvDanger hover:bg-pvDanger/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Notifications Slide-over Drawer */}
      <NotificationDrawer />

      {/* Logout Confirmation Prompt Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
