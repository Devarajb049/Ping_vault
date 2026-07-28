import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageTransition } from '../components/PageTransition';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Activity, ShieldCheck, ShieldAlert, Monitor, RefreshCw, Search } from 'lucide-react';
import { getSocket } from '../socket/socket';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userAgent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white">
            Audit Logs & Security Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Cryptographic security event trail tracking authentication and payload operations. Zero IP address tracking.
          </p>
        </div>

        <button
          onClick={fetchActivity}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/15 hover:bg-pvPrimary/25 text-pvPrimary border border-pvPrimary/30 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-pvPrimary" />
            <h2 className="font-jakarta font-bold text-lg text-white">Recent Vault Activity</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search audit action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 text-slate-200 text-xs rounded-2xl pl-9 pr-4 py-2.5 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : (
          <>
            {/* Mobile Card List View (RWD) */}
            <div className="space-y-3 block sm:hidden">
              {filteredLogs.map((log) => (
                <div key={log._id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-pvPrimary text-xs">{log.action}</span>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-pvSuccess/15 text-pvSuccess border border-pvSuccess/30'
                          : 'bg-pvDanger/15 text-pvDanger border border-pvDanger/30'
                      }`}
                    >
                      {log.status === 'SUCCESS' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      <span>{log.status}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">{log.details || 'N/A'}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1 truncate max-w-[180px]">
                      <Monitor className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{log.userAgent}</span>
                    </div>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-mono text-xs italic">
                  No activity logs recorded yet.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Event Action</th>
                    <th className="p-4">User Agent / Client</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-pvPrimary">{log.action}</span>
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{log.userAgent}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-pvSuccess/15 text-pvSuccess border border-pvSuccess/30'
                              : 'bg-pvDanger/15 text-pvDanger border border-pvDanger/30'
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
                      <td className="p-4 text-slate-300">{log.details || 'N/A'}</td>
                      <td className="p-4 text-right font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-mono italic">
                        No activity logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};
