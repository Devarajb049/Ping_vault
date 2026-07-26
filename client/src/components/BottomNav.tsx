import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Upload, FolderLock, Send, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { ProfileMenuModal } from './ProfileMenuModal';

export const BottomNav: React.FC = () => {
  const { setIsDrawerOpen } = useNotifications();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/create', label: 'Upload', icon: Upload },
    { to: '/received', label: 'Received', icon: FolderLock },
    { to: '/sent', label: 'Sent', icon: Send },
  ];

  return (
    <>
      <nav className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-md pointer-events-auto pb-[env(safe-area-inset-bottom,0px)] md:hidden">

        <div className="flex items-center justify-between bg-pvDark/95 backdrop-blur-2xl border border-pvAccent/40 rounded-full px-3 py-1.5 sm:py-2 shadow-2xl shadow-pvAccent/20">
          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex-1 min-w-0 min-h-[48px] py-1 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'bg-pvAccent/20 text-pvAccent scale-105 shadow-glow-primary font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs tracking-tight truncate w-full text-center leading-tight mt-0.5">
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Profile Tab (Triggers Profile Menu Modal) */}
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsProfileMenuOpen(true);
            }}
            title="Profile & Menu"
            className={`flex-1 min-w-0 min-h-[48px] py-1 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
              isProfileMenuOpen
                ? 'bg-pvAccent/20 text-pvAccent scale-105 shadow-glow-primary font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs tracking-tight truncate w-full text-center leading-tight mt-0.5">
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* Profile Menu Bottom Sheet Modal */}
      <ProfileMenuModal isOpen={isProfileMenuOpen} onClose={() => setIsProfileMenuOpen(false)} />
    </>
  );
};
