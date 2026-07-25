import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CryptoClient } from '../utils/cryptoClient';
import { Shield, FileText, Upload, Plus, X, Lock, Clock, Eye, EyeOff, AlertCircle, CheckCircle2, Send } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-8 space-y-6 sm:space-y-8 pb-24 md:pb-8 w-full overflow-x-hidden">
      <div>
        <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-2">Create & Upload Encrypted File</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transmit zero-knowledge encrypted notes and multi-format files directly to verified User IDs (e.g. {userPublicId}).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs sm:text-sm flex items-center space-x-3 shadow-md animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
        {/* Recipient User IDs Section */}
        <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-4 w-full">
          <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            1. Target User IDs (e.g. {userPublicId})
          </label>
          <p className="text-xs text-slate-400">Enter recipient User IDs. Public key exchange occurs automatically.</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddReceiver();
                }
              }}
              placeholder={`e.g. ${userPublicId}`}
              className="flex-1 bg-pvDarker border border-pvAccent/30 focus:border-pvAccent rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono w-full min-w-0"
            />
            <button
              type="button"
              onClick={handleAddReceiver}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent border border-pvAccent/40 transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recipient</span>
            </button>
          </div>

          {receiverError && <p className="text-xs text-pvDanger font-bold animate-pulse">{receiverError}</p>}

          {/* Chips list */}
          <div className="flex flex-wrap gap-2 pt-2">
            {recipientList.map((id) => (
              <span
                key={id}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-pvAccent/10 border border-pvAccent/40 font-mono text-xs font-bold text-pvAccent shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-pvSuccess" />
                <span>{id}</span>
                <button type="button" onClick={() => removeReceiver(id)} className="text-slate-400 hover:text-pvDanger">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {recipientList.length === 0 && <span className="text-xs text-slate-500 italic">No recipients added yet.</span>}
          </div>
        </div>

        {/* Payload Content Tabs & Upload */}
        <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-6 w-full">
          <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            2. Vault Payload Content
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Vault Title (Encrypted)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Confidential Financial Reports & Code"
              className="w-full bg-pvDarker border border-pvAccent/30 focus:border-pvAccent rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none min-w-0"
            />
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-pvAccent/20 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`pb-2 sm:pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'text'
                  ? 'border-pvAccent text-pvAccent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Text / Note / Credentials</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`pb-2 sm:pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'file'
                  ? 'border-pvAccent text-pvAccent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>File Upload (PDF, ZIP, DOCX)</span>
            </button>
          </div>

          {activeTab === 'text' ? (
            <div>
              <textarea
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type confidential note, passwords, API keys, or secret content here..."
                className="w-full bg-pvDarker border border-pvAccent/30 focus:border-pvAccent rounded-xl p-4 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none min-w-0"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-pvAccent/30 hover:border-pvAccent rounded-2xl p-6 sm:p-8 text-center bg-pvDarker/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-pvAccent mx-auto animate-pulse" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-1">
                    {file ? file.name : 'Click to select or Drag & Drop file'}
                  </div>
                  {file && (
                    <div className="text-xs text-pvTeal font-mono">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB — Type: {file.type || 'Binary'}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Supported: <span className="text-slate-300 font-semibold">PDF, ZIP, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, PNG, JPEG, MP4, MP3</span> (Max 50MB)
                </div>
              </label>

              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-4 px-3 py-1 rounded-lg bg-pvDanger/20 text-pvDanger hover:bg-pvDanger/30 text-xs font-bold transition-colors"
                >
                  Remove File
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expiration Rules with Custom Time & Custom Views */}
        <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-pvAccent/30 space-y-6 w-full">
          <label className="block text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            3. Expiration Policies
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Time Expiry */}
            <div className="space-y-2 min-w-0 w-full">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-pvAccent" />
                <span>Time-Based Expiry</span>
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
                className="w-full max-w-full bg-pvDarker border border-pvAccent/30 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none min-w-0"
              >
                <option value={10}>⏱ 10 Minutes</option>
                <option value={30}>⏱ 30 Minutes</option>
                <option value={60}>⏱ 1 Hour</option>
                <option value={360}>⏱ 6 Hours</option>
                <option value={720}>⏱ 12 Hours</option>
                <option value={1440}>⏱ 1 Day (Default)</option>
                <option value={10080}>⏱ 7 Days</option>
                <option value={43200}>⏱ 30 Days</option>
                <option value={-1}>∞ Never Expire</option>
                <option value="custom">⚙ Custom Time Expiry...</option>
              </select>

              {/* Custom Time Input Controls */}
              {isCustomTime && (
                <div className="flex gap-2 pt-2 animate-fade-in w-full">
                  <input
                    type="number"
                    min={1}
                    value={customTimeValue}
                    onChange={(e) => setCustomTimeValue(Math.max(1, Number(e.target.value)))}
                    className="w-1/2 bg-pvDarker border border-pvAccent/40 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none min-w-0"
                    placeholder="Enter duration"
                  />
                  <select
                    value={customTimeUnit}
                    onChange={(e) => setCustomTimeUnit(e.target.value as any)}
                    className="w-1/2 bg-pvDarker border border-pvAccent/40 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none min-w-0"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              )}
            </div>

            {/* View Limit */}
            <div className="space-y-2 min-w-0 w-full">
              <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-pvPurple" />
                <span>View-Based Limit</span>
              </label>
              <select
                value={isCustomViews ? 'custom' : maxViews || ''}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomViews(true);
                  } else {
                    setIsCustomViews(false);
                    setMaxViews(e.target.value ? Number(e.target.value) : undefined);
                  }
                }}
                className="w-full max-w-full bg-pvDarker border border-pvAccent/30 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none min-w-0"
              >
                <option value="">👁 Unlimited Views</option>
                <option value={2}>👁 2 Views</option>
                <option value={5}>👁 5 Views</option>
                <option value={10}>👁 10 Views</option>
                <option value={25}>👁 25 Views</option>
                <option value="custom">⚙ Custom View Limit...</option>
              </select>

              {/* Custom Views Input Control */}
              {isCustomViews && (
                <div className="pt-2 animate-fade-in w-full">
                  <input
                    type="number"
                    min={1}
                    value={customViewsValue}
                    onChange={(e) => setCustomViewsValue(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-pvDarker border border-pvAccent/40 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none min-w-0"
                    placeholder="Enter maximum view limit count..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Password Protection & Self Destruct Toggle Switches with Distinct Borders */}
          <div className="space-y-4 pt-4 border-t border-pvAccent/20 w-full">
            {/* Password Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-pvWarning" />
                  <span>Optional Secondary Password</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400">Require additional password before decryption</div>
              </div>

              {/* Custom Pill Toggle Switch with Border & Glow */}
              <button
                type="button"
                role="switch"
                aria-checked={isPasswordProtected}
                onClick={() => setIsPasswordProtected(!isPasswordProtected)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none ml-3 ${
                  isPasswordProtected
                    ? 'bg-pvAccent border-pvAccent shadow-glow-primary'
                    : 'bg-pvDarker border-pvAccent/50 hover:border-pvAccent'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPasswordProtected ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isPasswordProtected && (
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  placeholder="Set secondary vault password..."
                  className="w-full bg-pvDarker border border-pvAccent/30 rounded-xl pl-4 pr-11 py-2.5 text-xs sm:text-sm text-white focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Self Destruct Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Self-Destruct (Delete After Reading)</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Destroy payload & encryption key immediately upon view</div>
              </div>

              {/* Custom Danger Pill Toggle Switch with Border */}
              <button
                type="button"
                role="switch"
                aria-checked={deleteAfterReading}
                onClick={() => setDeleteAfterReading(!deleteAfterReading)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none ml-3 ${
                  deleteAfterReading
                    ? 'bg-pvDanger border-pvDanger shadow-sm'
                    : 'bg-pvDarker border-pvAccent/50 hover:border-pvAccent'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    deleteAfterReading ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{loading ? 'Encrypting Payload & Transmitting...' : 'Encrypt & Transmit Vault'}</span>
        </button>
      </form>
    </div>
  );
};
