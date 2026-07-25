import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldCheck, ShieldAlert, Monitor, RefreshCw } from 'lucide-react';
import { getSocket } from '../socket/socket';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/v1/activity');
      if (res.data.success) {
        setLogs(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivity();

    // Listen to real-time socket events for dynamic log updates
    const socket = getSocket();
    if (socket) {
      const handleRealtimeUpdate = () => {
        fetchActivity();
      };

      socket.on('vault_received', handleRealtimeUpdate);
      socket.on('vault_opened', handleRealtimeUpdate);
      socket.on('notification', handleRealtimeUpdate);

      return () => {
        socket.off('vault_received', handleRealtimeUpdate);
        socket.off('vault_opened', handleRealtimeUpdate);
        socket.off('notification', handleRealtimeUpdate);
      };
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-white mb-2">Audit Logs & Security Trail</h1>
          <p className="text-sm text-slate-400">
            Cryptographic security event trail tracking authentication and payload operations. Zero IP address tracking.
          </p>
        </div>

        <button
          onClick={fetchActivity}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-all flex items-center space-x-2 self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl glass-panel border border-pvAccent/30 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-pvAccent/20 pb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-pvAccent" />
            <h2 className="font-poppins font-bold text-xl text-white">Recent Vault Activity</h2>
          </div>
          <span className="text-xs font-mono text-pvAccent bg-pvAccent/10 px-3 py-1 rounded-full border border-pvAccent/30">
            {logs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pvAccent/20 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">User Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pvAccent/10 text-sm">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-pvAccent/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-pvAccent text-xs">{log.action}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                    <div className="flex items-center space-x-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{log.userAgent}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-pvSuccess/10 text-pvSuccess border border-pvSuccess/30'
                          : 'bg-pvDanger/10 text-pvDanger border border-pvDanger/30'
                      }`}
                    >
                      {log.status === 'SUCCESS' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      <span>{log.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">{log.details || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
