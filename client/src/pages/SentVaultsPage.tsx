import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PageTransition } from '../components/PageTransition';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ShareModal } from '../components/ShareModal';
import {
  Send,
  Eye,
  ShieldAlert,
  Trash2,
  Clock,
  RefreshCw,
  AlertCircle,
  Share2,
  Users,
  ShieldCheck,
  Ban,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const SentVaultsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [createdVaults, setCreatedVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Vault Modal State
  const [selectedVaultModal, setSelectedVaultModal] = useState<any | null>(null);
  const [shareModalVaultId, setShareModalVaultId] = useState<string | null>(null);

  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'Unlimited';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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

  const handleRevoke = async (vaultId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handleDeleteVault = async (vaultId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this vault? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/api/v1/vaults/delete/${vaultId}`);
      if (res.data.success) {
        addToast('File Deleted', 'The shared vault has been permanently deleted.', 'danger');
        if (selectedVaultModal?.id === vaultId) {
          setSelectedVaultModal(null);
        }
        fetchCreatedVaults();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete vault');
    }
  };

  // Filter sent vaults by search query (title or recipient ID)
  const filteredVaults = createdVaults.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = v.titleEncrypted?.toLowerCase().includes(q);
    const matchRecipient = v.recipients?.some((r: any) =>
      r.receiverId?.toLowerCase().includes(q)
    );
    return matchTitle || matchRecipient;
  });

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white">
            Sent Vaults & Transmissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor recipient access status, view counters, share links, or revoke access in real-time.
          </p>
        </div>

        <button
          onClick={fetchCreatedVaults}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/15 hover:bg-pvPrimary/25 text-pvPrimary border border-pvPrimary/30 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Sent Feed</span>
        </button>
      </div>

      {/* Search Bar Toolbar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sent vaults by title or recipient User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary text-slate-200 text-xs rounded-2xl pl-9 pr-9 py-2.5 outline-none transition-all placeholder:text-slate-500 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <span className="text-xs font-mono text-slate-400">
            Found <span className="text-pvPrimary font-bold">{filteredVaults.length}</span> vault(s)
          </span>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs sm:text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="card" count={4} />
      ) : filteredVaults.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center text-slate-500 mx-auto">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {searchQuery ? 'No Matching Sent Vaults Found' : 'No Transmitted Vaults Yet'}
            </h3>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? `No vaults found matching "${searchQuery}"`
                : 'Create your first zero-knowledge encrypted vault to transmit confidential payloads.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVaults.map((v) => {
            const now = new Date();
            const isExpired =
              (v.expiryTime && new Date(v.expiryTime) < now) ||
              (v.maxViews && v.totalViews >= v.maxViews);

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVaultModal(v)}
                className={`p-6 rounded-3xl glass-card space-y-4 cursor-pointer transition-all ${
                  isExpired ? 'border-pvDanger/30 bg-pvDanger/5' : 'hover:border-pvPrimary/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-jakarta font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md" title={v.titleEncrypted}>
                        {v.titleEncrypted || 'Encrypted Vault Payload'}
                      </h3>
                      {isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-pvDanger/20 text-pvDanger border border-pvDanger/40 text-[10px] font-bold uppercase">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/40 text-[10px] font-bold uppercase">
                          Active Transmission
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Created: {formatDateTime(v.createdAt)}</span>
                      <span>
                        Views: <strong className="text-white">{v.totalViews}</strong> /{' '}
                        <span className="text-pvPrimary font-bold">{v.maxViews || '∞'}</span>
                      </span>
                      <span>Expires: {formatDateTime(v.expiryTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {!isExpired && (
                      <button
                        onClick={(e) => handleRevoke(v.id, e)}
                        className="px-3 py-2 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center space-x-1.5"
                        title="Revoke recipient access"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Revoke</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteVault(v.id, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-pvDanger hover:bg-pvDanger/10 transition-colors"
                      title="Delete vault permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recipient User IDs status breakdown */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-pvPrimary" />
                    <span>Recipients ({v.recipients?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.recipients?.map((rec: any) => (
                      <div
                        key={rec.receiverId}
                        className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs flex items-center space-x-2"
                      >
                        <span className="font-bold text-pvPrimary">{rec.receiverId}</span>
                        {rec.isOpened ? (
                          <span className="text-[10px] text-pvSuccess font-bold px-1.5 py-0.5 rounded bg-pvSuccess/20 border border-pvSuccess/30">
                            Opened ({rec.viewsCount}x)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                            Unopened
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
};
