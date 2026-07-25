import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CryptoClient } from '../utils/cryptoClient';
import { FolderLock, Key, FileText, Download, Lock, AlertTriangle, AlertCircle, ShieldCheck, RefreshCw, Copy, Check, Clock, Eye, Info, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const ReceivedVaultsPage: React.FC = () => {
  const { user, privateKeyPEM } = useAuth();
  const { addToast } = useNotifications();
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Decryption Modal State
  const [selectedVault, setSelectedVault] = useState<any | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNote, setCopiedNote] = useState(false);

  // Received Vault Activity & Details Modal State
  const [detailsModalVault, setDetailsModalVault] = useState<any | null>(null);

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
        addToast('🗑 Vault Removed', 'Received vault removed from your inbox.', 'danger');
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
    const isExpired = v.status === 'expired' || (v.expiryTime && new Date(v.expiryTime) < now) || (v.maxViews && v.viewsCount >= v.maxViews) || (v.deleteAfterReading && v.viewsCount >= 1);

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

        // Comprehensive private key resolution fallback chain
        const activePrivKey =
          privateKeyPEM ||
          (user?.receiverId ? localStorage.getItem(`pv_priv_${user.receiverId}`) : null) ||
          (user?.receiverId ? localStorage.getItem(`pv_priv_${user.receiverId.toLowerCase()}`) : null) ||
          (user?.receiverId ? localStorage.getItem(`pv_priv_key_${user.receiverId}`) : null) ||
          user?.encryptedPrivateKey;

        if (!activePrivKey) {
          throw new Error('Your RSA WebCrypto private key was not found. Please log out and sign in again to restore your key.');
        }

        // Save key locally to guarantee key persistence
        if (user?.receiverId && activePrivKey) {
          localStorage.setItem(`pv_priv_${user.receiverId}`, activePrivKey);
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

  // Determine if payload is an actual binary file download vs text note
  const isActualFilePayload = (payload: string, metadata?: any) => {
    if (!payload) return false;
    if (payload.startsWith('data:')) return true;
    if (metadata && metadata.mimeType && metadata.mimeType !== 'text/plain') return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-2">Received Encrypted Vaults</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Zero-knowledge incoming files and notes transmitted to your User ID ({user?.receiverId}).
          </p>
        </div>

        <button
          onClick={fetchReceivedVaults}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-all flex items-center space-x-2 self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {vaults.map((v) => {
          const now = new Date();
          const isExpired = v.status === 'expired' || (v.expiryTime && new Date(v.expiryTime) < now) || (v.maxViews && v.viewsCount >= v.maxViews) || (v.deleteAfterReading && v.viewsCount >= 1);

          return (
            <div
              key={v.sharedId}
              onClick={() => setDetailsModalVault(v)}
              className={`p-6 rounded-3xl glass-panel border transition-all space-y-6 flex flex-col justify-between shadow-xl cursor-pointer w-full overflow-hidden ${
                isExpired
                  ? 'border-pvDanger/40 bg-pvDanger/5 hover:border-pvDanger'
                  : 'border-pvAccent/30 hover:border-pvAccent'
              }`}
            >
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${isExpired ? 'bg-pvDanger/20 border-pvDanger/40 text-pvDanger' : 'bg-pvAccent/20 border-pvAccent/40 text-pvAccent'}`}>
                    <FolderLock className="w-5 h-5" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isExpired
                          ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/40 animate-pulse'
                          : 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/40'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReceivedVault(v.sharedId);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pvDanger hover:bg-pvDanger/10 transition-colors"
                      title="Delete Vault from Inbox"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-lg text-white break-words break-all min-w-0 max-w-full">
                    {v.titleEncrypted || 'Encrypted Payload'}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 truncate">From: {v.sender?.fullName || 'Anonymous Sender'} ({v.sender?.receiverId})</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-pvDarker/90 border border-pvAccent/20 space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span className="text-slate-200 font-semibold">{formatDateTime(v.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Expires:</span>
                    <span className={isExpired ? 'text-pvDanger font-bold' : 'text-pvAccent font-semibold'}>
                      {formatDateTime(v.expiryTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-pvAccent/10">
                    <span className="text-slate-500">Views Used:</span>
                    <span className={v.maxViews && v.viewsCount >= v.maxViews ? 'text-pvDanger font-bold' : 'text-white font-bold'}>
                      {v.viewsCount} / {v.maxViews || '∞'}
                    </span>
                  </div>

                  {v.isPasswordProtected && (
                    <div className="text-pvWarning font-semibold flex items-center space-x-1 pt-1 border-t border-pvAccent/10">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password Protection Enabled</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenVault(v);
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    isExpired
                      ? 'bg-pvDanger/20 hover:bg-pvDanger/30 text-pvDanger border border-pvDanger/40'
                      : 'bg-gradient-to-r from-pvPrimary to-pvAccent text-white shadow-glow-primary hover:opacity-90'
                  }`}
                >
                  {isExpired ? <Info className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  <span>{isExpired ? 'Expired Activity' : 'Decrypt Vault'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailsModalVault(v);
                  }}
                  className="px-3 py-3 rounded-xl bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-colors flex items-center justify-center"
                  title="View Activity & Details Modal"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {vaults.length === 0 && !loading && (
        <div className="text-center py-16 p-8 rounded-3xl glass-panel text-slate-400 space-y-3">
          <FolderLock className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="text-lg font-bold text-white">No Received Vaults</div>
          <p className="text-sm max-w-sm mx-auto">
            Share your User ID (<span className="text-pvAccent font-mono">{user?.receiverId}</span>) to receive encrypted payloads.
          </p>
        </div>
      )}

      {/* Received Vault Activity & Details Modal */}
      {detailsModalVault && (
        <div
          onClick={() => setDetailsModalVault(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl glass-panel border border-pvAccent/40 bg-pvDark/95 p-6 md:p-8 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-pvAccent/20 pb-4">
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <ShieldCheck className="w-6 h-6 text-pvAccent flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-poppins font-bold text-xl text-white truncate">Vault Activity Details</h3>
                  <p className="text-xs text-slate-400">Cryptographic status and access policy details.</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalVault(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs w-full">
              <div className="p-4 rounded-2xl bg-pvDarker border border-pvAccent/30 space-y-2 overflow-hidden">
                <div className="font-poppins font-bold text-base text-white break-words break-all">{detailsModalVault.titleEncrypted || 'Encrypted Vault'}</div>
                <div className="text-slate-400 truncate">From: {detailsModalVault.sender?.fullName || 'Sender'} ({detailsModalVault.sender?.receiverId})</div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      detailsModalVault.status === 'expired'
                        ? 'bg-pvDanger/20 text-pvDanger border border-pvDanger/30'
                        : 'bg-pvSuccess/20 text-pvSuccess border border-pvSuccess/30'
                    }`}
                  >
                    {detailsModalVault.status}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-pvDarker border border-pvAccent/30 space-y-3 text-slate-300">
                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-pvAccent" />
                    <span>Created Timestamp:</span>
                  </span>
                  <span className="text-white font-semibold">{formatDateTime(detailsModalVault.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-pvDanger" />
                    <span>Expiration Time:</span>
                  </span>
                  <span className="text-pvAccent font-bold">{formatDateTime(detailsModalVault.expiryTime)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-pvAccent/10 pb-2">
                  <span className="text-slate-500 flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-pvPurple" />
                    <span>Views Recorded:</span>
                  </span>
                  <span className="text-white font-bold">
                    {detailsModalVault.viewsCount} / {detailsModalVault.maxViews || '∞'} (Max Views: {detailsModalVault.maxViews || 'Unlimited'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteReceivedVault(detailsModalVault.sharedId)}
                className="w-1/2 py-3 rounded-xl font-bold text-xs bg-pvDanger/20 hover:bg-pvDanger/30 text-pvDanger border border-pvDanger/40 transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Vault</span>
              </button>
              <button
                onClick={() => setDetailsModalVault(null)}
                className="w-1/2 py-3 rounded-xl font-bold text-xs bg-pvAccent text-white hover:opacity-90 shadow-glow-primary transition-all"
              >
                Close Activity Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decryption Modal */}
      {selectedVault && (
        <div
          onClick={() => setSelectedVault(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl glass-panel border border-pvAccent/40 bg-pvDark/95 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-pvAccent/20 pb-4">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-pvSuccess" />
                <h3 className="font-poppins font-bold text-xl text-white">Decrypted Vault Payload</h3>
              </div>
              <button
                onClick={() => setSelectedVault(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {selectedVault.isPasswordProtected && !decryptedContent && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  decryptPayload(selectedVault, inputPassword);
                }}
                className="space-y-4"
              >
                <div className="text-xs text-slate-300">
                  This vault requires a secondary master password set by the sender:
                </div>
                <input
                  type="password"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter vault password..."
                  className="w-full bg-pvDarker border border-pvAccent/30 focus:border-pvAccent rounded-xl p-3 text-sm text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={decrypting}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-pvAccent text-white shadow-glow-primary hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {decrypting ? 'Decrypting...' : 'Unlock Vault'}
                </button>
              </form>
            )}

            {decryptedContent && (
              <div className="space-y-4">
                <div className="text-xs text-pvSuccess font-bold uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Decryption Successful (Zero-Knowledge Verified)</span>
                </div>

                {isActualFilePayload(decryptedContent, selectedVault.fileMetadata) ? (
                  /* FILE PAYLOAD DISPLAY & DOWNLOAD */
                  <div className="p-5 rounded-2xl bg-pvDarker border border-pvAccent/40 space-y-4 shadow-inner">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-pvAccent/20 border border-pvAccent/40 flex items-center justify-center text-pvAccent">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {selectedVault.fileMetadata?.originalNameEncrypted || 'Decrypted File'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {selectedVault.fileMetadata?.mimeType || 'Binary Data'}
                          {selectedVault.fileMetadata?.size
                            ? ` — ${(selectedVault.fileMetadata.size / (1024 * 1024)).toFixed(2)} MB`
                            : ''}
                        </div>
                      </div>
                    </div>

                    <a
                      href={decryptedContent}
                      download={selectedVault.fileMetadata?.originalNameEncrypted || 'decrypted_file'}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pvPrimary to-pvAccent text-white text-xs font-bold hover:opacity-90 shadow-glow-primary transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Decrypted File</span>
                    </a>
                  </div>
                ) : (
                  /* TEXT / NOTE PAYLOAD DISPLAY DIRECTLY */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Decrypted Note</span>
                      <button
                        onClick={() => copyNoteToClipboard(decryptedContent)}
                        className="px-3 py-1 rounded-lg bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        {copiedNote ? <Check className="w-3.5 h-3.5 text-pvSuccess" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNote ? 'Copied' : 'Copy Note'}</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-pvDarker border border-pvAccent/40 text-sm font-mono text-white whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed shadow-inner border-l-4 border-l-pvAccent">
                      {decryptedContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
