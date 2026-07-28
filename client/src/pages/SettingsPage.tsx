import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { Copy, Check, Moon, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const copyReceiverId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white mb-2">
          System Preferences & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your Receiver ID profile, theme preferences, and security options.
        </p>
      </div>

      {/* Receiver ID Box */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Immutable Receiver ID
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/90 border border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="font-mono text-2xl font-extrabold text-pvPrimary tracking-widest">
              {user?.receiverId}
            </div>
            <div className="text-xs text-slate-400">
              This Receiver ID is permanently mapped to your browser RSA public key.
            </div>
          </div>

          <button
            onClick={copyReceiverId}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/20 hover:bg-pvPrimary/30 text-pvPrimary border border-pvPrimary/40 transition-colors flex items-center space-x-2 self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-pvSuccess" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>
        </div>
      </div>



      {/* Notification Preferences */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Real-Time Notifications
        </label>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-pvPrimary" />
            <div>
              <h4 className="text-xs font-bold text-white">Desktop & WebSocket Push Notifications</h4>
              <p className="text-[11px] text-slate-400">
                Receive instant toasts when an encrypted vault is delivered to your User ID.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-pvPrimary bg-slate-900 border-slate-700 focus:ring-pvPrimary"
          />
        </div>
      </div>
    </PageTransition>
  );
};
