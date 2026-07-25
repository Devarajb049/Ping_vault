import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';

const LOADING_MESSAGES = [
  'Encrypting your files with WebCrypto...',
  'Building secure zero-knowledge connection...',
  'Preparing your digital vault locker...',
  'Verifying cryptographic receiver keys...',
  'Syncing encrypted payload storage...',
  'Initializing PingVault E2EE environment...',
  'Ready.',
];

export const PremiumLoader: React.FC<{ progress?: number }> = ({ progress = 75 }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % (LOADING_MESSAGES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pvDarker text-white p-6 font-inter select-none animate-fade-in">
      {/* Top Edge Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-pvDarker">
        <div
          className="h-full bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal transition-all duration-500 shadow-glow-primary"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col items-center space-y-8 max-w-sm text-center">
        {/* Assembling Animated Brand Logo */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-pvAccent/20 blur-xl animate-pulse" />
          <BrandLogo size="xl" variant="full" className="relative z-10 animate-bounce" />
        </div>

        {/* Dynamic Loading Status Text */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-pvAccent tracking-wide h-6 transition-all animate-pulse">
            {LOADING_MESSAGES[messageIndex]}
          </div>

          <div className="w-48 h-1.5 bg-pvDark/90 rounded-full border border-pvAccent/30 overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
