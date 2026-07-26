import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Send, Eye, FileText, CheckCircle2, ArrowRight, Zap, RefreshCw, Key } from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';
import { BrandLogo } from '../components/BrandLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen text-slate-100 bg-pvDarker overflow-hidden">
      <MatrixBackground />

      {/* Header / Nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
        <BrandLogo size="sm" variant="full" className="sm:hidden" />
        <BrandLogo size="md" variant="full" className="hidden sm:inline-flex" />
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <Link
            to="/login"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-pvAccent/10 transition-all whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-pvPrimary to-pvAccent text-white shadow-glow-primary hover:opacity-90 transition-all whitespace-nowrap"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pvAccent/10 border border-pvAccent/30 text-pvAccent text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 max-w-full">
          <Zap className="w-3.5 h-3.5 text-pvAccent flex-shrink-0" />
          <span className="truncate">Zero-Knowledge Multi-Recipient Data Transmission</span>
        </div>

        <h1 className="font-poppins text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Secure. Encrypt. <br />
          <span className="bg-gradient-to-r from-pvAccent via-pvTeal to-pvPurple bg-clip-text text-transparent">
            Share. Control.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-inter">
          Store, encrypt, and securely transmit confidential notes, passwords, credentials, and multi-format files using unique <span className="text-pvAccent font-bold">Receiver IDs</span> with complete control over access, view limits, and self-destruction.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal text-white shadow-glow-primary hover:scale-105 transition-all flex items-center justify-center space-x-3">
            <span>Create Your Vault</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-pvDark/80 border border-pvAccent/40 text-slate-200 hover:bg-pvDark hover:border-pvAccent transition-all">
            Access Existing Vault
          </Link>
        </div>

        {/* Transmission Visual Architecture with Infinite Pipeline Stream */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl glass-panel border border-pvAccent/30 shadow-2xl shadow-pvPrimary/30 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          {/* Background Neon Flow Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-pvAccent/15 to-emerald-500/10 opacity-50 blur-xl" />

          {/* Node 1: Sender */}
          <div className="relative z-10 w-full md:w-1/3 p-5 rounded-2xl bg-pvDarker/95 border border-pvAccent/40 text-center shadow-lg transform transition-transform group-hover:scale-[1.02]">
            <div className="relative inline-flex mb-3">
              <div className="absolute -inset-2 rounded-full bg-pvAccent/20 blur-md animate-pulse" />
              <Key className="w-8 h-8 text-pvAccent relative z-10 animate-bounce" />
            </div>
            <div className="text-base font-extrabold text-white">Sender</div>
            <div className="text-xs text-teal-300/90 font-mono mt-1">Browser E2EE</div>
          </div>

          {/* Flow Connector 1 (Vertical on Mobile / Horizontal on Desktop) */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center py-2 md:py-0 w-full md:w-auto">
            {/* Desktop Connector Line */}
            <div className="hidden md:flex items-center space-x-2 relative w-16 h-1 bg-pvDarker rounded-full overflow-hidden border border-pvAccent/30">
              <div className="w-6 h-full bg-gradient-to-r from-pvAccent to-emerald-400 rounded-full animate-data-flow-h" />
            </div>
            {/* Mobile Connector Line */}
            <div className="md:hidden flex flex-col items-center space-y-1 relative h-12 w-1 bg-pvDarker rounded-full overflow-hidden border border-pvAccent/30">
              <div className="h-6 w-full bg-gradient-to-b from-pvAccent to-emerald-400 rounded-full animate-data-flow-v" />
            </div>
          </div>

          {/* Node 2: Cipher Engine */}
          <div className="relative z-10 w-full md:w-1/3 p-5 rounded-2xl bg-pvDarker/95 border border-pvPurple/40 text-center shadow-lg transform transition-transform group-hover:scale-[1.02]">
            <div className="relative inline-flex mb-3">
              <div className="absolute -inset-2 rounded-full bg-pvPurple/30 blur-md animate-pulse" />
              <Lock className="w-8 h-8 text-purple-400 relative z-10 animate-pulse" />
            </div>
            <div className="text-base font-extrabold text-white">AES-256-GCM</div>
            <div className="text-xs text-purple-300/90 font-mono mt-1">Payload Cipher</div>
          </div>

          {/* Flow Connector 2 (Vertical on Mobile / Horizontal on Desktop) */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center py-2 md:py-0 w-full md:w-auto">
            {/* Desktop Connector Line */}
            <div className="hidden md:flex items-center space-x-2 relative w-16 h-1 bg-pvDarker rounded-full overflow-hidden border border-pvAccent/30">
              <div className="w-6 h-full bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full animate-data-flow-h" style={{ animationDelay: '0.9s' }} />
            </div>
            {/* Mobile Connector Line */}
            <div className="md:hidden flex flex-col items-center space-y-1 relative h-12 w-1 bg-pvDarker rounded-full overflow-hidden border border-pvAccent/30">
              <div className="h-6 w-full bg-gradient-to-b from-purple-400 to-emerald-400 rounded-full animate-data-flow-v" style={{ animationDelay: '0.9s' }} />
            </div>
          </div>

          {/* Node 3: Receiver */}
          <div className="relative z-10 w-full md:w-1/3 p-5 rounded-2xl bg-pvDarker/95 border border-emerald-500/40 text-center shadow-lg transform transition-transform group-hover:scale-[1.02]">
            <div className="relative inline-flex mb-3">
              <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
              <Send className="w-8 h-8 text-emerald-400 relative z-10 animate-bounce" />
            </div>
            <div className="text-base font-extrabold text-white">Receiver ID</div>
            <div className="text-xs text-emerald-300/90 font-mono mt-1">demo1002</div>
          </div>
        </div>
      </section>


      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-pvAccent/20">
        <div className="text-center mb-16">
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-4">Enterprise Security Architecture</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built from the ground up for strict confidentiality and zero server-side exposure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-panel-hover glass-panel space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pvAccent/10 border border-pvAccent/30 flex items-center justify-center text-pvAccent">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Receiver ID Sharing</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No need to expose email addresses. Send encrypted vaults directly to unique immutable IDs like <span className="font-mono text-pvAccent font-semibold">demo1002</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel-hover glass-panel space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pvPurple/10 border border-pvPurple/30 flex items-center justify-center text-pvPurple">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Multi-Recipient E2EE</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Encrypt the vault symmetric key with RSA-4096 public keys of multiple receivers simultaneously.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel-hover glass-panel space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pvSuccess/10 border border-pvSuccess/30 flex items-center justify-center text-pvSuccess">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Combined Expiration</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enforce strict expiration rules: Time-based (e.g. 24 hours) OR View-based limit (e.g. 3 views), whichever comes first.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-pvAccent/20 py-8 text-center text-xs text-slate-400">
        <p>© 2026 Ping Vault Platform. All rights reserved. Zero-Knowledge E2EE Architecture.</p>
      </footer>
    </div>
  );
};
