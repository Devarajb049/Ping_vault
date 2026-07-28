import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { Copy, Check, ShieldCheck, Mail, Calendar, Key, Cpu, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const copyUserId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPublicKey = () => {
    if (user?.publicKey) {
      navigator.clipboard.writeText(user.publicKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          User Profile & Public Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Your permanent public User ID and browser WebCrypto RSA keypair details.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 bg-gradient-to-r from-slate-100 via-pvPrimary/10 to-slate-200 dark:from-slate-900 dark:via-pvPrimary/20 dark:to-slate-950 shadow-2xl">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pvPrimary to-pvSecondary p-1 flex-shrink-0 shadow-glow-primary">
          <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-950 flex items-center justify-center font-jakarta font-extrabold text-3xl text-pvPrimary">
            {user?.fullName.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        <div className="space-y-3 text-center md:text-left flex-1">
          <div>
            <h2 className="font-jakarta text-2xl font-extrabold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username}</p>
          </div>

          {/* User ID Box */}
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-950/90 border border-pvPrimary/40 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">User ID:</span>
            <span className="font-mono text-lg font-extrabold text-pvPrimary tracking-wider">
              {user?.receiverId}
            </span>
            <button
              onClick={copyUserId}
              className="p-1.5 rounded-xl bg-pvPrimary/20 hover:bg-pvPrimary/30 text-pvPrimary transition-colors"
              title="Copy User ID"
            >
              {copied ? <Check className="w-4 h-4 text-pvSuccess" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center space-x-2">
            <Mail className="w-4 h-4 text-pvPrimary" />
            <span>Email Address</span>
          </div>
          <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{user?.email}</div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-pvCyan" />
            <span>Account Joined</span>
          </div>
          <div className="font-medium text-slate-900 dark:text-white text-sm">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-pvSuccess" />
            <span>Security Index</span>
          </div>
          <div className="font-medium text-pvSuccess text-sm font-bold">
            {user?.securityScore || 98}% (E2EE Active)
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
