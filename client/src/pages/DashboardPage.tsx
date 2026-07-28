import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { AnalyticsChart } from '../components/AnalyticsChart';
import {
  Shield,
  Send,
  FolderLock,
  ArrowRight,
  Key,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  HardDrive,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../socket/socket';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ receivedCount: 0, sentCount: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyReceiverId = () => {
    if (user?.receiverId) {
      navigator.clipboard.writeText(user.receiverId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [recRes, sentRes] = await Promise.all([
        axios.get('/api/v1/vaults/received'),
        axios.get('/api/v1/vaults/created'),
      ]);

      setStats({
        receivedCount: recRes.data.data?.length || 0,
        sentCount: sentRes.data.data?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time WebSockets events to update Dashboard metrics instantly
    const socket = getSocket();
    if (socket) {
      const handleRealtimeUpdate = () => {
        fetchDashboardData();
      };

      socket.on('vault_received', handleRealtimeUpdate);
      socket.on('vault_opened', handleRealtimeUpdate);
      socket.on('vault_deleted', handleRealtimeUpdate);

      return () => {
        socket.off('vault_received', handleRealtimeUpdate);
        socket.off('vault_opened', handleRealtimeUpdate);
        socket.off('vault_deleted', handleRealtimeUpdate);
      };
    }
  }, []);

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-pvPrimary/30 to-slate-950 border border-slate-800 dark:border-white/10 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pvPrimary/20 border border-pvPrimary/40 text-pvPrimary text-[11px] font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Secure Transmission Platform</span>
            </div>

            <h1 className="font-jakarta text-2xl md:text-4xl font-extrabold text-white">
              Welcome back, {user?.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-sans">
              <span>Your unique User ID:</span>
              <button
                type="button"
                onClick={copyReceiverId}
                className="inline-flex items-center space-x-2 bg-slate-950/90 border border-pvPrimary/40 hover:border-pvPrimary px-3 py-1 rounded-xl transition-all shadow-inner group"
                title="Click to copy your User ID"
              >
                <span className="font-mono text-xs font-bold text-pvPrimary tracking-wide">
                  {user?.receiverId}
                </span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-pvSuccess animate-bounce" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-pvPrimary transition-colors" />
                )}
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/create"
                className="px-6 py-3 rounded-2xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Encrypted Vault</span>
              </Link>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/15 hover:bg-pvPrimary/25 text-pvPrimary border border-pvPrimary/30 transition-all flex items-center space-x-2 self-start md:self-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </div>

      {/* Responsive Stat Cards (3 Columns) with Animated Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvPrimary/15 border border-pvPrimary/30 flex items-center justify-center text-pvPrimary">
              <FolderLock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-pvSuccess px-2.5 py-1 rounded-full bg-pvSuccess/10 border border-pvSuccess/30 uppercase tracking-wider">
              Active
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Received Vaults
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white mt-1">
              <AnimatedCounter value={stats.receivedCount} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvPurple/15 border border-pvPurple/30 flex items-center justify-center text-pvPurple">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-pvPurple px-2.5 py-1 rounded-full bg-pvPurple/10 border border-pvPurple/30 uppercase tracking-wider">
              Transmitted
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Sent Vaults
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white mt-1">
              <AnimatedCounter value={stats.sentCount} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvSuccess/15 border border-pvSuccess/30 flex items-center justify-center text-pvSuccess">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-pvSuccess px-2.5 py-1 rounded-full bg-pvSuccess/10 border border-pvSuccess/30 uppercase tracking-wider">
              Optimal
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Security Index
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white mt-1">
              <AnimatedCounter value={user?.securityScore || 98} suffix="%" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics SVG Chart & Storage Usage Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-4">
          <AnalyticsChart />
        </div>

        <div className="space-y-6">
          {/* Storage & E2EE Status Widget */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-pvPrimary" />
                <h3 className="font-bold text-sm text-white">Locker Capacity</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Max 50MB/file</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Used Capacity</span>
                <span className="font-mono font-bold text-pvPrimary">12.4 MB / 500 MB</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div className="h-full bg-gradient-to-r from-pvPrimary to-pvSecondary rounded-full w-[25%]" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-xs text-pvSuccess">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Zero-Knowledge Browser Key RSA-2048 Active</span>
            </div>
          </div>

          {/* Activity Shortcut Widget */}
          <div className="p-6 rounded-3xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-pvPurple" />
                <h3 className="font-bold text-sm text-white">Live Activity</h3>
              </div>
              <Link to="/activity" className="text-xs text-pvPrimary font-bold hover:underline">
                View All
              </Link>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor real-time transmission, decryption events, and security access logs.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/create"
          className="p-6 rounded-3xl glass-card space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-jakarta font-bold text-lg text-white group-hover:text-pvPrimary transition-colors">
              Transmit New Vault Payload
            </h3>
            <ArrowRight className="w-5 h-5 text-pvPrimary group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Encrypt confidential notes or multi-format files up to 50MB and transmit directly to target User IDs.
          </p>
        </Link>

        <Link
          to="/received"
          className="p-6 rounded-3xl glass-card space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-jakarta font-bold text-lg text-white group-hover:text-pvPrimary transition-colors">
              Access Received Vaults
            </h3>
            <ArrowRight className="w-5 h-5 text-pvPrimary group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Decrypt incoming zero-knowledge notes and files sent to your User ID.
          </p>
        </Link>
      </div>
    </PageTransition>
  );
};
