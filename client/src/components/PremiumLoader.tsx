import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';

const DEFAULT_MESSAGES = [
  'Initializing WebCrypto Zero-Knowledge Environment...',
  'Generating RSA-2048 & AES-256 Cryptographic Session Keys...',
  'Verifying Zero-Trust Receiver Directory...',
  'Establishing Encrypted WebSocket Pipeline...',
  'Securing Payload Transmission Channels...',
  'Ready.',
];

interface PremiumLoaderProps {
  progress?: number;
  message?: string;
  fullScreen?: boolean;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  progress = 85,
  message,
  fullScreen = true,
}) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (message) return;
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % (DEFAULT_MESSAGES.length - 1));
    }, 1600);
    return () => clearInterval(timer);
  }, [message]);

  const activeMessage = message || DEFAULT_MESSAGES[msgIdx];

  const content = (
    <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md text-center bg-pvDark/80 backdrop-blur-xl border border-pvTeal/30 rounded-3xl shadow-2xl shadow-pvPrimary/40 space-y-7 animate-fade-in">
      {/* Outer Spinning Cyber Ring */}
      <div className="relative flex items-center justify-center">
        {/* Animated Pulsing Outer Glow */}
        <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-pvPrimary via-pvAccent to-teal-400 opacity-25 blur-xl animate-pulse" />

        {/* Outer Revolving Ring */}
        <div className="w-28 h-28 rounded-full border-2 border-transparent border-t-pvAccent border-r-pvTeal animate-spin duration-1000" />
        
        {/* Counter-Spinning Inner Ring */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-transparent border-b-sky-400 border-l-emerald-400 animate-spin duration-700 reverse" />

        {/* Center Logo Emblem */}
        <div className="absolute flex items-center justify-center">
          <BrandLogo size="lg" variant="icon" />
        </div>
      </div>

      {/* Security Status Indicator */}
      <div className="space-y-3 w-full">
        <BrandLogo size="md" variant="full" showTagline className="justify-center" />

        <div className="flex items-center justify-center space-x-2 text-xs font-mono font-medium text-teal-300/90 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="h-5 flex items-center transition-all duration-300">
            {activeMessage}
          </span>
        </div>

        {/* Smooth Animated Progress Bar */}
        <div className="w-full bg-slate-900/90 h-2 rounded-full border border-pvTeal/20 overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-pvPrimary via-pvAccent to-teal-300 rounded-full transition-all duration-500 shadow-glow-primary relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cryptographic Badges */}
      <div className="flex items-center justify-center space-x-4 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-4 w-full">
        <span className="flex items-center space-x-1">
          <Lock className="w-3 h-3 text-pvAccent" />
          <span>RSA-2048</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <Cpu className="w-3 h-3 text-pvTeal" />
          <span>AES-256-GCM</span>
        </span>
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pvDarker/95 backdrop-blur-2xl select-none">
      {/* Top Edge Neon Pulse Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-pvDarker z-50">
        <div
          className="h-full bg-gradient-to-r from-pvPrimary via-pvAccent to-emerald-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {content}
    </div>
  );
};

