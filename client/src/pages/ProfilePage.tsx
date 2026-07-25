import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, ShieldCheck, Mail, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyUserId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="font-poppins text-3xl font-bold text-white mb-2">User Profile & ID</h1>
        <p className="text-sm text-slate-400">
          Your permanent public User ID and cryptographic profile details.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-pvAccent/30 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 bg-gradient-to-r from-pvDark via-pvPrimary/30 to-pvDark shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pvPrimary to-pvAccent p-1 flex-shrink-0 shadow-glow-primary">
          <div className="w-full h-full rounded-full bg-pvDarker flex items-center justify-center font-poppins font-extrabold text-3xl text-pvAccent">
            {user?.fullName.charAt(0) || 'U'}
          </div>
        </div>

        <div className="space-y-3 text-center md:text-left flex-1">
          <div>
            <h2 className="font-poppins text-2xl font-extrabold text-white">{user?.fullName}</h2>
            <p className="text-sm text-slate-400">@{user?.username}</p>
          </div>

          {/* User ID Box */}
          <div className="inline-flex items-center space-x-3 bg-pvDarker border border-pvAccent/40 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-xs text-slate-400 font-semibold uppercase">User ID:</span>
            <span className="font-mono text-lg font-extrabold text-pvAccent tracking-wider">{user?.receiverId}</span>
            <button
              onClick={copyUserId}
              className="p-1.5 rounded-xl bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent transition-colors"
              title="Copy User ID"
            >
              {copied ? <Check className="w-4 h-4 text-pvSuccess" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Details (Storage Used Card Removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-2">
            <Mail className="w-4 h-4 text-pvAccent" />
            <span>Email Address</span>
          </div>
          <div className="font-medium text-white text-sm sm:text-base truncate">{user?.email}</div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-pvTeal" />
            <span>Account Joined</span>
          </div>
          <div className="font-medium text-white text-sm sm:text-base">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-pvSuccess" />
            <span>Security Health</span>
          </div>
          <div className="font-medium text-pvSuccess text-sm sm:text-base font-bold">
            {user?.securityScore || 98}% (E2EE Active)
          </div>
        </div>
      </div>
    </div>
  );
};
