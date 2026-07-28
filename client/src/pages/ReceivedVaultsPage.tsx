import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CryptoClient } from '../utils/cryptoClient';
import { PageTransition } from '../components/PageTransition';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  FolderLock,
  Key,
  FileText,
  Download,
  Lock,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Eye,
  Trash2,
  Search,
  X,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLocation } from 'react-router-dom';

export const ReceivedVaultsPage: React.FC = () => {
  const { user, privateKeyPEM } = useAuth();
  const { addToast } = useNotifications();
  const location = useLocation();

  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Read URL query parameter if passed from Navbar search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
  }, [location.search]);

  // Decryption Modal State
  const [selectedVault, setSelectedVault] = useState<any | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNote, setCopiedNote] = useState(false);

  // Details Modal State
  const [detailsModalVault, setDetailsModalVault] = useState<any | null>(null);

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

  const fetchReceivedVaults = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/v1/vaults/received');
      if (res.data.success) {
        setVaults(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceivedVaults();
  }, []);

  const handleDeleteReceivedVault = async (sharedId: string) => {
    if (!window.confirm('Are you sure you want to remove this received vault from your inbox?')) return;
    try {
      const res = await axios.delete(`/api/v1/vaults/received/delete/${sharedId}`);
      if (res.data.success) {
        addToast('Vault Removed', 'Received vault removed from your inbox.', 'danger');
        if (detailsModalVault?.sharedId === sharedId) {
          setDetailsModalVault(null);
        }
        fetchReceivedVaults();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleOpenVault = async (v: any) => {
    const now = new Date();
    const isExpired =
      v.status === 'expired' ||
      (v.expiryTime && new Date(v.expiryTime) < now) ||
      (v.maxViews && v.viewsCount >= v.maxViews) ||
      (v.deleteAfterReading && v.viewsCount >= 1);

    if (isExpired) {
      setDetailsModalVault(v);
      return;
    }

    setSelectedVault(v);
    setDecryptedContent(null);
    setError(null);
    setInputPassword('');
    setCopiedNote(false);

    if (!v.isPasswordProtected) {
      await decryptPayload(v, '');
    }
  };

  const decryptPayload = async (v: any, pass: string) => {
    setDecrypting(true);
    setError(null);

    try {
      const res = await axios.post(`/api/v1/vaults/open/${v.vaultId}`, {
        password: pass || undefined,
      });

      if (res.data.success) {
        const { ciphertext, iv, encryptedSymmetricKey } = res.data.data;

        const activePrivKey =
          privateKeyPEM ||
          (user?.receiverId ? localStorage.getItem(`pv_priv_${user.receiverId}`) : null) ||
          user?.encryptedPrivateKey;

        if (!activePrivKey) {
          throw new Error('Your RSA private key was not found. Please re-login.');
        }

        const payload = await CryptoClient.decryptVault(
          encryptedSymmetricKey,
          ciphertext,
          iv,
          activePrivKey
        );

        setDecryptedContent(payload);
        fetchReceivedVaults();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Decryption failed');
    } finally {
      setDecrypting(false);
    }
  };

  const copyNoteToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const isActualFilePayload = (payload: string, metadata?: any) => {
    if (!payload) return false;
    // Base64 Data URLs (e.g. data:image/png;base64,...) are file attachments
    if (payload.startsWith('data:') && payload.includes(';base64,')) return true;
    // Explicit file attachments with non-plain text mime type or original name
    if (metadata?.originalNameEncrypted && metadata?.mimeType && metadata.mimeType !== 'text/plain') {
      return true;
    }
    return false;
  };

  const handleDownloadFile = (payload: string, metadata?: any) => {
    try {
      const fileName = metadata?.originalNameEncrypted || 'decrypted-payload.bin';
      const link = document.createElement('a');
      link.href = payload;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
    }
  };

  // Filter vaults by search & status
  const filteredVaults = vaults.filter((v) => {
    const matchSearch =
      v.titleEncrypted?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.senderReceiverId?.toLowerCase().includes(searchQuery.toLowerCase());

    const now = new Date();
    const isExpired =
      v.status === 'expired' ||
      (v.expiryTime && new Date(v.expiryTime) < now) ||
      (v.maxViews && v.viewsCount >= v.maxViews);

    if (statusFilter === 'active') return matchSearch && !isExpired;
    if (statusFilter === 'expired') return matchSearch && isExpired;
    return matchSearch;
  });

  return (
    <PageTransition className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white">
            Received Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Incoming zero-knowledge encrypted vaults sent to your User ID ({user?.receiverId}).
          </p>
        </div>

        <button
          onClick={fetchReceivedVaults}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-pvPrimary/15 hover:bg-pvPrimary/25 text-pvPrimary border border-pvPrimary/30 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter title or Sender ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary text-slate-200 text-xs rounded-2xl pl-9 pr-4 py-2.5 outline-none transition-all"
          />
        </div>

        <div className="flex space-x-2 w-full md:w-auto">
          {(['all', 'active', 'expired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl font-bold text-xs capitalize transition-all ${
                statusFilter === st
                  ? 'bg-pvPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table / Cards */}
      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : filteredVaults.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center text-slate-500 mx-auto">
            <FolderLock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">No Received Vaults Found</h3>
            <p className="text-xs text-slate-400">Your inbox is empty or no vaults match the filter.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl glass-panel border border-slate-800 dark:border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Vault Title</th>
                  <th className="p-4">Sender ID</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {filteredVaults.map((v) => {
                  const now = new Date();
                  const isExpired =
                    v.status === 'expired' ||
                    (v.expiryTime && new Date(v.expiryTime) < now) ||
                    (v.maxViews && v.viewsCount >= v.maxViews);

                  return (
                    <tr
                      key={v._id}
                      className="hover:bg-slate-800/40 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleOpenVault(v)}
                    >
                      <td className="p-4 font-bold text-white flex items-center space-x-2">
                        {v.fileMetadata ? (
                          <Download className="w-4 h-4 text-pvPrimary flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-pvPurple flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[180px] sm:max-w-xs" title={v.titleEncrypted}>{v.titleEncrypted || 'Encrypted Vault'}</span>
                      </td>

                      <td className="p-4 font-mono text-pvPrimary font-semibold">
                        {v.senderReceiverId}
                      </td>

                      <td className="p-4 text-slate-400">
                        {formatDateTime(v.expiryTime)}
                      </td>

                      <td className="p-4 font-mono">
                        {v.viewsCount} / {v.maxViews || '∞'}
                      </td>

                      <td className="p-4">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full bg-pvDanger/15 text-pvDanger border border-pvDanger/30 text-[10px] font-bold uppercase">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-pvSuccess/15 text-pvSuccess border border-pvSuccess/30 text-[10px] font-bold uppercase">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          {!isExpired && (
                            <button
                              onClick={() => handleOpenVault(v)}
                              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 transition-all"
                            >
                              Decrypt
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReceivedVault(v.sharedId)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-pvDanger hover:bg-pvDanger/10 transition-colors"
                            title="Delete from Inbox"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decryption Modal */}
      {selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedVault(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg bg-slate-900 dark:bg-pvBg border border-slate-800 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-pvPrimary" />
                <h3 className="font-bold text-base text-white">
                  Decrypt: {selectedVault.titleEncrypted}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVault(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedVault.isPasswordProtected && !decryptedContent && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  decryptPayload(selectedVault, inputPassword);
                }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>This vault is protected with a secondary password passphrase.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Enter Vault Passphrase
                  </label>
                  <input
                    type="password"
                    required
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Enter secondary password"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-pvPrimary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={decrypting}
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:opacity-90"
                >
                  {decrypting ? 'Decrypting...' : 'Unlock & Decrypt'}
                </button>
              </form>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Decrypted Content View */}
            {decryptedContent && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-pvSuccess/10 border border-pvSuccess/30 text-pvSuccess text-xs flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Payload Decrypted via Browser WebCrypto RSA</span>
                  </span>
                </div>

                {isActualFilePayload(decryptedContent, selectedVault.fileMetadata) ? (
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                    <Download className="w-10 h-10 text-pvPrimary mx-auto animate-bounce" />
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {selectedVault.fileMetadata?.originalNameEncrypted || 'Decrypted File Payload'}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Ready for instant local browser save
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDownloadFile(decryptedContent, selectedVault.fileMetadata)
                      }
                      className="px-6 py-3 rounded-2xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 flex items-center justify-center space-x-2 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Decrypted Note Content</label>
                      <button
                        onClick={() => copyNoteToClipboard(decryptedContent)}
                        className="text-xs font-bold text-pvPrimary hover:underline flex items-center space-x-1"
                      >
                        {copiedNote ? <Check className="w-3.5 h-3.5 text-pvSuccess" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNote ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-60 whitespace-pre-wrap break-all">
                      {decryptedContent}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
};
