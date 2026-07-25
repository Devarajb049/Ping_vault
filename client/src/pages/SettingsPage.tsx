import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Copy, Check, Shield, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyReceiverId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-poppins text-3xl font-bold text-white mb-2">Account & Receiver Settings</h1>
        <p className="text-sm text-slate-400">
          Manage your Receiver ID profile, cryptographic key pairs, and security configuration.
        </p>
      </div>

      {/* Receiver ID Box */}
      <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Immutable Receiver ID
        </label>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-pvDarker border border-pvAccent/40">
          <div className="space-y-1">
            <div className="font-mono text-2xl font-extrabold text-pvAccent tracking-widest">{user?.receiverId}</div>
            <div className="text-xs text-slate-400">This Receiver ID is permanently mapped to your RSA public key.</div>
          </div>

          <button
            onClick={copyReceiverId}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-colors flex items-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-pvSuccess" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          User Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <span className="text-xs text-slate-500 block">Full Name</span>
            <span className="font-semibold text-white">{user?.fullName}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Username</span>
            <span className="font-semibold text-white">{user?.username}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Email</span>
            <span className="font-semibold text-white">{user?.email}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Security Rating</span>
            <span className="font-semibold text-pvSuccess">{user?.securityScore || 98}% (Maximum E2EE Protection)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
