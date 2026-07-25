import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, Eye, ShieldAlert, Trash2, Clock, CheckCircle2, UserCheck, RefreshCw, AlertCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const SentVaultsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [createdVaults, setCreatedVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Selected Vault Modal State (Active or Expired)
  const [selectedVaultModal, setSelectedVaultModal] = useState<any | null>(null);

  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'Never (Unlimited)';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const fetchCreatedVaults = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/v1/vaults/created');
      if (res.data.success) {
        setCreatedVaults(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCreatedVaults();
  }, []);

  const handleRevoke = async (vaultId: string) => {
    if (!window.confirm('Are you sure you want to revoke recipient access to this vault?')) return;
    try {
      const res = await axios.post('/api/v1/vaults/revoke', { vaultId });
      if (res.data.success) {
        addToast('Access Revoked', 'Recipient access has been revoked successfully.', 'warning');
        if (selectedVaultModal?.id === vaultId) {
          setSelectedVaultModal(null);
        }
        fetchCreatedVaults();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to revoke access');
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this vault and all associated logs? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/api/v1/vaults/delete/${vaultId}`);
      if (res.data.success) {
        addToast('🗑 File Deleted', 'The shared vault has been permanently deleted.', 'danger');
        if (selectedVaultModal?.id === vaultId) {
          setSelectedVaultModal(null);
        }
        fetchCreatedVaults();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete vault');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-2">Sent Vaults & Access Controls</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time recipient view status, revoke access, or purge vaults permanently.
          </p>
        </div>

        <button
          onClick={fetchCreatedVaults}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-all flex items-center space-x-2 self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs sm:text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="space-y-6 w-full">
        {createdVaults.map((v) => {
          const now = new Date();
          const isExpired = (v.expiryTime && new Date(v.expiryTime) < now) || (v.maxViews && v.totalViews >= v.maxViews);

          return (
            <div
              key={v.id}
              onClick={() => setSelectedVaultModal(v)}
              className={`p-4 sm:p-6 rounded-3xl glass-panel border transition-all space-y-6 shadow-xl cursor-pointer w-full overflow-hidden ${
                isExpired
                  ? 'border-pvDanger/40 bg-pvDanger/5 hover:border-pvDanger'
                  : 'border-pvAccent/30 hover:border-pvAccent'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pvAccent/20 pb-4 w-full">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-poppins font-bold text-lg sm:text-xl text-white break-words break-all min-w-0 max-w-full">
                      {v.titleEncrypted || 'Encrypted Vault'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex-shrink-0 ${
                        isExpired
                          ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/40 animate-pulse'
                          : 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/40'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Vault Creation & View Counts with Format Date Helper */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 pt-1">
                    <span>Created: {formatDateTime(v.createdAt)}</span>
                    <span>
                      Views Used: <strong className="text-white">{v.totalViews}</strong> / <span className="text-pvAccent font-bold">{v.maxViews || '∞'}</span> (Max Views: <span className="text-pvTeal font-bold">{v.maxViews || 'Unlimited'}</span>)
                    </span>
                    <span>Expiry: {formatDateTime(v.expiryTime)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 self-start md:self-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleRevoke(v.id)}
                    className="px-3.5 py-2 rounded-xl font-bold text-xs bg-pvWarning/20 hover:bg-pvWarning/30 text-pvWarning border border-pvWarning/40 transition-colors flex items-center space-x-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVault(v.id)}
                    className="px-3.5 py-2 rounded-xl font-bold text-xs bg-pvDanger/20 hover:bg-pvDanger/30 text-pvDanger border border-pvDanger/40 transition-colors flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Recipient Transmission Log Table */}
              <div className="space-y-3 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recipient Transmission Log ({v.recipients?.length || 0})
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVaultModal(v);
                    }}
                    className="text-xs font-bold text-pvAccent hover:underline flex items-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>View Vault Audit Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {v.recipients && v.recipients.length > 0 ? (
                    v.recipients.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-pvDarker/80 border border-pvAccent/20 flex items-center justify-between text-xs font-mono min-w-0"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="font-bold text-pvAccent flex items-center space-x-1.5 truncate">
                            <UserCheck className="w-3.5 h-3.5 text-pvSuccess flex-shrink-0" />
                            <span className="truncate">{rec.receiverId || 'Recipient'}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">
                            Views: {rec.viewsCount} {rec.lastViewedAt ? `(Last: ${formatDateTime(rec.lastViewedAt)})` : '(Not opened yet)'}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                            rec.status === 'opened'
                              ? 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/30'
                              : rec.status === 'revoked'
                              ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/30'
                              : 'bg-pvWarning/20 text-pvWarning border border-pvWarning/30'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic py-2">No recipients associated with this vault log.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {createdVaults.length === 0 && !loading && (
        <div className="text-center py-16 p-8 rounded-3xl glass-panel text-slate-400 space-y-3">
          <Send className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="text-lg font-bold text-white">No Sent Vaults</div>
          <p className="text-sm max-w-sm mx-auto">Create and transmit zero-knowledge encrypted vaults to view access logs here.</p>
        </div>
      )}

      {/* Vault Transmission Details & Audit Modal */}
      {selectedVaultModal && (
        <div
          onClick={() => setSelectedVaultModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl glass-panel border border-pvAccent/40 bg-pvDark/95 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-pvAccent/20 pb-4">
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <ShieldCheck className="w-6 h-6 text-pvAccent flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-xl text-white truncate">Vault Transmission Details</h3>
                  <p className="text-xs text-slate-400">Cryptographic zero-knowledge delivery status.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVaultModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs w-full">
              <div className="p-4 rounded-2xl bg-pvDarker border border-pvAccent/30 space-y-2 w-full overflow-hidden">
                <div className="font-poppins font-bold text-base text-white break-words break-all">
                  {selectedVaultModal.titleEncrypted || 'Encrypted Vault'}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedVaultModal.expiryTime && new Date(selectedVaultModal.expiryTime) < new Date()
                        ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/30'
                        : 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/30'
                    }`}
                  >
                    {selectedVaultModal.expiryTime && new Date(selectedVaultModal.expiryTime) < new Date() ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-pvDarker border border-pvAccent/30 space-y-3 text-slate-300">
                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500">Created Timestamp:</span>
                  <span className="text-white font-semibold">{formatDateTime(selectedVaultModal.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500">Expiration Setting:</span>
                  <span className="text-pvAccent font-bold">{formatDateTime(selectedVaultModal.expiryTime)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500">Views Recorded:</span>
                  <span className="text-white font-bold">
                    {selectedVaultModal.totalViews} / {selectedVaultModal.maxViews || '∞'} (Max Views: {selectedVaultModal.maxViews || 'Unlimited'})
                  </span>
                </div>
              </div>

              {/* Recipient Audit Activity inside Modal */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-white uppercase text-[11px]">Recipient Transmission Log ({selectedVaultModal.recipients?.length || 0}):</div>
                <div className="space-y-2">
                  {selectedVaultModal.recipients?.map((rec: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-pvDarker border border-pvAccent/20 flex items-center justify-between min-w-0">
                      <div className="min-w-0 pr-2">
                        <div className="text-pvAccent font-bold truncate">{rec.receiverId}</div>
                        <div className="text-slate-400 text-[10px] truncate">
                          Views Used: {rec.viewsCount} {rec.lastViewedAt ? `(Opened: ${formatDateTime(rec.lastViewedAt)})` : '(Pending access)'}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                          rec.status === 'opened'
                            ? 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/30'
                            : rec.status === 'revoked'
                            ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/30'
                            : 'bg-pvWarning/20 text-pvWarning border border-pvWarning/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleRevoke(selectedVaultModal.id)}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-pvWarning/20 hover:bg-pvWarning/30 text-pvWarning border border-pvWarning/40 transition-colors flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Revoke Access</span>
              </button>
              <button
                onClick={() => handleDeleteVault(selectedVaultModal.id)}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-pvDanger/20 hover:bg-pvDanger/30 text-pvDanger border border-pvDanger/40 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
