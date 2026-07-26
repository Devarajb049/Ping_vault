import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Send, FolderLock, ArrowRight, Key, Plus, RefreshCw, Copy, Check } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-pvDark via-pvPrimary/40 to-pvDark border border-pvAccent/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pvAccent/20 border border-pvAccent/40 text-pvAccent text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure Transmission Platform</span>
            </div>

            <h1 className="font-poppins text-2xl md:text-4xl font-extrabold text-white">
              Welcome back, {user?.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 font-inter">
              <span>Your unique User ID:</span>
              <button
                type="button"
                onClick={copyReceiverId}
                className="inline-flex items-center space-x-2 bg-pvDarker/90 border border-pvAccent/50 hover:border-pvAccent px-3 py-1 rounded-xl transition-all shadow-inner group"
                title="Click to copy your User ID"
              >
                <span className="font-mono text-sm font-extrabold text-pvAccent tracking-wide">{user?.receiverId}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-pvSuccess animate-bounce" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-pvAccent transition-colors" />
                )}
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/create"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-pvPrimary to-pvAccent text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Encrypted Vault</span>
              </Link>
            </div>
          </div>


          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-all flex items-center space-x-2 self-start md:self-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {/* Responsive Stat Cards (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-4 hover:border-pvAccent transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvAccent/20 border border-pvAccent/40 flex items-center justify-center text-pvAccent">
              <FolderLock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-pvSuccess px-2.5 py-1 rounded-full bg-pvSuccess/10 border border-pvSuccess/30">
              Active
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Received Vaults</div>
            <div className="font-poppins font-extrabold text-3xl text-white mt-1">{stats.receivedCount}</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-4 hover:border-pvAccent transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvAccent/20 border border-pvAccent/40 flex items-center justify-center text-pvAccent">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-pvAccent px-2.5 py-1 rounded-full bg-pvAccent/10 border border-pvAccent/30">
              Transmitted
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sent Vaults</div>
            <div className="font-poppins font-extrabold text-3xl text-white mt-1">{stats.sentCount}</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-4 hover:border-pvAccent transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pvSuccess/20 border border-pvSuccess/40 flex items-center justify-center text-pvSuccess">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-pvSuccess px-2.5 py-1 rounded-full bg-pvSuccess/10 border border-pvSuccess/30">
              Optimal
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Security Score</div>
            <div className="font-poppins font-extrabold text-3xl text-white mt-1">
              {user?.securityScore || 98}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/create"
          className="p-6 rounded-3xl glass-panel border border-pvAccent/30 hover:border-pvAccent transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-lg text-white group-hover:text-pvAccent transition-colors">
              Transmit New Vault Payload
            </h3>
            <ArrowRight className="w-5 h-5 text-pvAccent group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Encrypt confidential notes or multi-format files up to 50MB and transmit directly to target User IDs.
          </p>
        </Link>

        <Link
          to="/received"
          className="p-6 rounded-3xl glass-panel border border-pvAccent/30 hover:border-pvAccent transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-poppins font-bold text-lg text-white group-hover:text-pvAccent transition-colors">
              Access Received Vaults
            </h3>
            <ArrowRight className="w-5 h-5 text-pvAccent group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Decrypt incoming zero-knowledge notes and files sent to your User ID.
          </p>
        </Link>
      </div>
    </div>
  );
};
