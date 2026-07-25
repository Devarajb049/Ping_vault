import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderLock,
  Share2,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'Create Vault', icon: PlusCircle },
    { to: '/received', label: 'Received Vaults', icon: FolderLock },
    { to: '/sent', label: 'Sent Vaults', icon: Share2 },
    { to: '/profile', label: 'User Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-pvDark/95 backdrop-blur-2xl border-r border-pvAccent/20 p-4 flex-col justify-between hidden md:flex z-30 shadow-2xl">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="px-3 pt-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-pvAccent/20 text-pvAccent border border-pvAccent/40 shadow-glow-primary'
                      : 'text-slate-300 hover:text-white hover:bg-pvAccent/10'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Security Status Box */}
      <div className="p-4 rounded-2xl bg-pvDarker/90 border border-pvAccent/30 space-y-2">
        <div className="flex items-center space-x-2 text-pvSuccess">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Vault Protected</span>
        </div>
        <p className="text-[11px] text-slate-400">Zero-Knowledge Encryption Active</p>
      </div>
    </aside>
  );
};
