import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Database, HardDrive, ShieldCheck } from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="font-poppins text-3xl font-bold text-white mb-2">Enterprise Admin Control Panel</h1>
        <p className="text-sm text-slate-400">
          System telemetry, storage metrics, and global cryptographic security status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-pvAccent" />
          </div>
          <div className="font-poppins text-3xl font-extrabold text-white">{stats?.totalUsers || 0}</div>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Encrypted Vaults</span>
            <Database className="w-4 h-4 text-pvTeal" />
          </div>
          <div className="font-poppins text-3xl font-extrabold text-white">{stats?.totalVaults || 0}</div>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Encrypted Storage Used</span>
            <HardDrive className="w-4 h-4 text-pvPurple" />
          </div>
          <div className="font-poppins text-3xl font-extrabold text-white">{stats?.storageUsedMB || 0} MB</div>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>System Health Score</span>
            <ShieldCheck className="w-4 h-4 text-pvSuccess" />
          </div>
          <div className="font-poppins text-3xl font-extrabold text-pvSuccess">{stats?.securityScore || 98.4}%</div>
        </div>
      </div>
    </div>
  );
};
