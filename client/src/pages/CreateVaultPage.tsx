import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CryptoClient } from '../utils/cryptoClient';
import { PageTransition } from '../components/PageTransition';
import {
  Shield,
  FileText,
  Upload,
  Plus,
  X,
  Lock,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Send,
  UserPlus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const CreateVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Multi-Receiver User ID State e.g. deva1280
  const [receiverInput, setReceiverInput] = useState('');
  const [recipientList, setRecipientList] = useState<string[]>([]);
  const [recipientMap, setRecipientMap] = useState<Record<string, string>>({});
  const [receiverError, setReceiverError] = useState<string | null>(null);

  // Expiration State
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Time Expiry State
  const [expiryMinutes, setExpiryMinutes] = useState<number>(1440); // 24h default
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState<number>(2);
  const [customTimeUnit, setCustomTimeUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  // View Expiry State
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined);
  const [isCustomViews, setIsCustomViews] = useState(false);
  const [customViewsValue, setCustomViewsValue] = useState<number>(50);

  const [deleteAfterReading, setDeleteAfterReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userPublicId = user?.receiverId || 'deva1280';

  const handleFileSelect = (selectedFile: File | null) => {
    setError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Immediate 50MB file size limit validation check
    const maxSizeBytes = 50 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setError(`File "${selectedFile.name}" (${fileSizeMB} MB) exceeds maximum 50MB upload limit`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // Add Receiver User ID chip (e.g. deva1280)
  const handleAddReceiver = async () => {
    if (!receiverInput.trim()) return;
    const recId = receiverInput.trim().toLowerCase();
    setReceiverError(null);

    // Prevent user from adding their own User ID as recipient
    if (recId === userPublicId.toLowerCase()) {
      setReceiverError('You cannot send a vault to your own User ID!');
      return;
    }

    if (recipientList.includes(recId)) {
      setReceiverError('User ID already added');
      return;
    }

    try {
      const res = await axios.get(`/api/v1/receivers/lookup/${recId}`);
      if (res.data.success) {
        const pubKey = res.data.data.publicKey;
        setRecipientList([...recipientList, recId]);
        setRecipientMap({ ...recipientMap, [recId]: pubKey });
        setReceiverInput('');
      }
    } catch (err: any) {
      setReceiverError(err.response?.data?.message || `User ID "${recId}" invalid or not found`);
    }
  };

  const removeReceiver = (recId: string) => {
    setRecipientList(recipientList.filter((id) => id !== recId));
    const updated = { ...recipientMap };
    delete updated[recId];
    setRecipientMap(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Vault title is required');
      return;
    }

    if (recipientList.length === 0) {
      setError('At least one Recipient User ID is required');
      return;
    }

    if (activeTab === 'text' && !textContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    if (activeTab === 'file' && !file) {
      setError('Please select a valid file (up to 50MB) to encrypt and transmit');
      return;
    }

    setLoading(true);

    try {
      let rawPayload = '';
      let fileMetadata = undefined;

      if (activeTab === 'text') {
        rawPayload = textContent;
      } else if (file) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('File size exceeds maximum 50MB limit');
        }

        rawPayload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        fileMetadata = {
          originalNameEncrypted: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
        };
      }

      // Calculate final expiry minutes
      let finalExpiryMinutes: number | undefined = expiryMinutes;
      if (isCustomTime) {
        if (customTimeUnit === 'minutes') finalExpiryMinutes = customTimeValue;
        else if (customTimeUnit === 'hours') finalExpiryMinutes = customTimeValue * 60;
        else if (customTimeUnit === 'days') finalExpiryMinutes = customTimeValue * 1440;
      }

      // Calculate final max views
      let finalMaxViews: number | undefined = maxViews;
      if (isCustomViews) {
        finalMaxViews = customViewsValue;
      }

      // 1. WebCrypto Zero-Knowledge E2EE Encryption in browser
      const encrypted = await CryptoClient.encryptVault(rawPayload, recipientMap);

      // 2. Submit payload to Backend
      const res = await axios.post('/api/v1/vaults/create', {
        titleEncrypted: title,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        fileMetadata,
        recipientReceiverIds: recipientList,
        encryptedSymmetricKeys: encrypted.encryptedSymmetricKeys,
        isPasswordProtected,
        vaultPassword: isPasswordProtected ? vaultPassword : undefined,
        expiryMinutes: finalExpiryMinutes === -1 ? undefined : finalExpiryMinutes,
        maxViews: finalMaxViews || undefined,
        deleteAfterReading,
      });

      if (res.data.success) {
        navigate('/sent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Vault creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto p-2 sm:p-4 md:p-8 space-y-6 sm:space-y-8 pb-24 md:pb-8 w-full overflow-x-hidden">
      <div>
        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Create & Upload Encrypted Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transmit zero-knowledge encrypted notes and multi-format files directly to target User IDs (e.g. {userPublicId}).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs sm:text-sm flex items-center space-x-3 shadow-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
        {/* Recipient User IDs Section */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-4 w-full">
          <label htmlFor="create-target-users" className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            1. Target Recipient User IDs
          </label>
          <p className="text-xs text-slate-400">Enter recipient User IDs. Public key exchange occurs automatically.</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <UserPlus className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="create-target-users"
                name="targetUsers"
                type="text"
                value={receiverInput}
                onChange={(e) => setReceiverInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReceiver();
                  }
                }}
                placeholder={`e.g. receiver1020`}
                className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none font-mono focus:ring-2 focus:ring-pvPrimary/30 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAddReceiver}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-pvPrimary/20 hover:bg-pvPrimary/30 text-pvPrimary border border-pvPrimary/40 transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recipient</span>
            </button>
          </div>

          {receiverError && <p className="text-xs text-pvDanger font-bold animate-pulse">{receiverError}</p>}

          {/* Recipient Chips List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {recipientList.map((id) => (
              <span
                key={id}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-pvPrimary/15 border border-pvPrimary/40 text-pvPrimary font-mono text-xs font-bold"
              >
                <span>{id}</span>
                <button
                  type="button"
                  onClick={() => removeReceiver(id)}
                  className="text-slate-400 hover:text-pvDanger transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Vault Content Section */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-5 w-full">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            2. Vault Payload Details
          </h3>

          <div>
            <label htmlFor="create-title" className="block text-xs font-semibold text-slate-300 mb-2">
              Vault Title / Label
            </label>
            <input
              id="create-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Confidential Financial Statement Q3"
              className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pvPrimary/30 transition-all"
            />
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex rounded-2xl bg-slate-950/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'text'
                  ? 'bg-pvPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Encrypted Note</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'file'
                  ? 'bg-pvPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>File Payload (Up to 50MB)</span>
            </button>
          </div>

          {activeTab === 'text' ? (
            <div>
              <label htmlFor="create-note-content" className="block text-xs font-semibold text-slate-300 mb-2">
                Confidential Note Content
              </label>
              <textarea
                id="create-note-content"
                name="textContent"
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter sensitive notes, API keys, seed phrases, or private communications..."
                className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary rounded-2xl p-4 text-xs sm:text-sm text-white font-mono placeholder-slate-500 outline-none focus:ring-2 focus:ring-pvPrimary/30 transition-all"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">File Attachment</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-pvPrimary rounded-3xl p-8 text-center bg-slate-950/60 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-pvPrimary/15 border border-pvPrimary/30 flex items-center justify-center text-pvPrimary group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200">
                      {file ? file.name : 'Click or Drag & Drop File to Encrypt'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB (${file.type || 'octet-stream'})`
                        : 'Supports all file formats up to 50MB'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Expiration Options */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel space-y-5 w-full">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            3. Protection & Expiration Rules
          </h3>

          {/* Password Protection Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-pvPrimary" />
                <span className="text-xs font-bold text-slate-200">Secondary Password Lock</span>
              </div>
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 rounded text-pvPrimary bg-slate-900 border-slate-700 focus:ring-pvPrimary"
              />
            </div>

            {isPasswordProtected && (
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  placeholder="Set secondary passphrase"
                  className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 focus:border-pvPrimary rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pvPrimary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Time Expiry Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-pvPrimary" />
              <span>Time-based Expiration</span>
            </label>
            <select
              value={isCustomTime ? 'custom' : expiryMinutes}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomTime(true);
                } else {
                  setIsCustomTime(false);
                  setExpiryMinutes(Number(e.target.value));
                }
              }}
              className="w-full bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 text-slate-200 text-xs rounded-2xl px-4 py-2.5 outline-none font-sans"
            >
              <option value={60}>1 Hour</option>
              <option value={720}>12 Hours</option>
              <option value={1440}>24 Hours (1 Day - Default)</option>
              <option value={10080}>7 Days</option>
              <option value={-1}>Never Expire (Keep Until Deleted)</option>
              <option value="custom">Custom Time Limit...</option>
            </select>

            {isCustomTime && (
              <div className="flex gap-2 pt-2">
                <input
                  type="number"
                  min={1}
                  value={customTimeValue}
                  onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                  className="w-24 bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none font-mono"
                />
                <select
                  value={customTimeUnit}
                  onChange={(e) => setCustomTimeUnit(e.target.value as any)}
                  className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            )}
          </div>

          {/* Self Destruct Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-pvDanger flex items-center space-x-1.5">
                <Trash2 className="w-4 h-4" />
                <span>Self-Destruct After Single Read</span>
              </span>
              <p className="text-[11px] text-slate-400">Vault automatically wipes after first successful decryption.</p>
            </div>
            <input
              type="checkbox"
              checked={deleteAfterReading}
              onChange={(e) => setDeleteAfterReading(e.target.checked)}
              className="w-4 h-4 rounded text-pvDanger bg-slate-900 border-slate-700 focus:ring-pvDanger"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-3xl font-extrabold text-sm bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Encrypting & Transmitting Payload...' : 'Encrypt & Transmit Vault'}</span>
        </button>
      </form>
    </PageTransition>
  );
};
