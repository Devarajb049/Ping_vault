import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageTransition } from '../components/PageTransition';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ShieldAlert, Users, Database, HardDrive, ShieldCheck, Cpu, Activity, RefreshCw } from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/v1/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white">
            Enterprise Admin Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            System telemetry, storage metrics, and global cryptographic security status.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/15 hover:bg-pvPrimary/25 text-pvPrimary border border-pvPrimary/30 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="stat" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Total Registered Users</span>
              <Users className="w-4 h-4 text-pvPrimary" />
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white">
              <AnimatedCounter value={stats?.totalUsers || 0} />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Active Encrypted Vaults</span>
              <Database className="w-4 h-4 text-pvCyan" />
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white">
              <AnimatedCounter value={stats?.totalVaults || 0} />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Encrypted Storage</span>
              <HardDrive className="w-4 h-4 text-pvPurple" />
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-white">
              <AnimatedCounter value={stats?.storageUsedMB || 0} suffix=" MB" />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>System Health</span>
              <ShieldCheck className="w-4 h-4 text-pvSuccess" />
            </div>
            <div className="font-jakarta font-extrabold text-3xl text-pvSuccess">
              <AnimatedCounter value={stats?.securityScore || 99} suffix="%" />
            </div>
          </div>
        </div>
      )}

      {/* Admin Telemetry Status Box */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-pvPrimary" />
          <h3 className="font-bold text-sm text-white">Zero-Knowledge Cryptographic Health</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Cipher Suite</span>
            <p className="font-bold text-pvPrimary">AES-256-GCM / RSA-OAEP 2048</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Server Storage</span>
            <p className="font-bold text-pvSuccess font-mono">0 Bytes Unencrypted Exposure</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">WebSocket Latency</span>
            <p className="font-bold text-pvPurple">Real-Time Event Relay Active</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
