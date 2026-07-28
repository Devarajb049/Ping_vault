import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderLock,
  Share2,
  Activity,
  User,
  PlusCircle,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/received', label: 'Received', icon: FolderLock },
    { to: '/create', label: 'Send', icon: PlusCircle },
    { to: '/sent', label: 'Sent', icon: Share2 },
    { to: '/activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
      <nav className="glass-panel bg-slate-950/90 dark:bg-pvBg/90 border border-slate-800/80 dark:border-white/10 rounded-2xl p-2 flex items-center justify-around shadow-2xl backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-pvPrimary font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
