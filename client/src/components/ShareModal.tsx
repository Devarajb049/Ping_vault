import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode as QrIcon, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: {
    id: string;
    titleEncrypted: string;
    fileMetadata?: { size?: number; mimeType?: string };
    expiryTime?: string;
    maxViews?: number;
  } | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, vault }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const shareLink = vault ? `${window.location.origin}/received?vaultId=${vault.id}` : '';

  useEffect(() => {
    if (vault && shareLink) {
      QRCode.toDataURL(shareLink, { width: 250, margin: 2, color: { dark: '#0FA4AF', light: '#050D1A' } })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [vault, shareLink]);

  if (!isOpen || !vault) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-pvAccent/40 bg-pvDark/95 p-6 space-y-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-1">
          <h3 className="font-poppins text-xl font-bold text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-pvAccent" />
            <span>Share Encrypted Vault</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold">{vault.titleEncrypted || 'Untitled Vault'}</p>
        </div>

        {/* QR Code Container */}
        {qrUrl && (
          <div className="p-4 rounded-2xl bg-pvDarker border border-pvAccent/30 text-center flex flex-col items-center justify-center">
            <img src={qrUrl} alt="Vault QR Code" className="w-48 h-48 rounded-xl border border-pvAccent/30" />
            <div className="text-xs text-slate-400 mt-2 font-mono">Scan QR Code to access</div>
          </div>
        )}

        {/* Copy Link Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase">Direct Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 bg-pvDarker border border-pvAccent/30 rounded-xl px-3 py-2 text-xs font-mono text-pvAccent select-all"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-xl bg-pvAccent/20 hover:bg-pvAccent/30 text-pvAccent font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-pvSuccess" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
