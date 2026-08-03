import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderLock,
  Share2,
  Activity,
  User,
  Settings,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'Send Vault', icon: PlusCircle },
    { to: '/received', label: 'Received Vaults', icon: FolderLock },
    { to: '/sent', label: 'Sent Vaults', icon: Share2 },
    { to: '/activity', label: 'Activity Logs', icon: Activity },
    { to: '/profile', label: 'User Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.splice(5, 0, { to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 ${collapsed ? 'w-20' : 'w-64'
        } bg-slate-950/95 dark:bg-pvBg/95 backdrop-blur-2xl border-r border-slate-800/60 dark:border-white/10 p-4 flex flex-col justify-between hidden md:flex z-30 transition-all duration-300 shadow-2xl`}
    >
      <div className="space-y-6">
        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                    ? 'bg-pvPrimary text-white shadow-glow-primary font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-white/5'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Security Status Widget */}
      {!collapsed ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-pvPrimary/10 border border-slate-800 dark:border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-pvSuccess">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">E2EE Protected</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            WebCrypto Zero-Knowledge AES-256 Engine Active
          </p>
        </div>
      ) : (
        <div className="flex justify-center p-2 text-pvSuccess" title="Zero-Knowledge E2EE Active">
          <ShieldCheck className="w-6 h-6" />
        </div>
      )}
    </aside>
  );
};
