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
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo size="md" variant="full" />
        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white hover:bg-pvAccent/10 transition-all">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-pvPrimary to-pvAccent text-white shadow-glow-primary hover:opacity-90 transition-all">
            Start Free
          </Link>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-pvAccent/10 border border-pvAccent/30 text-pvAccent text-xs font-semibold uppercase tracking-wider mb-8">
          <Zap className="w-4 h-4 text-pvAccent" />
          <span>Zero-Knowledge Multi-Recipient Data Transmission</span>
        </div>

        <h1 className="font-poppins text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Secure. Encrypt. <br />
          <span className="bg-gradient-to-r from-pvAccent via-pvTeal to-pvPurple bg-clip-text text-transparent">
            Share. Control.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-10 leading-relaxed font-inter">
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

        {/* Transmission Visual Architecture */}
        <div className="mt-16 p-8 rounded-3xl glass-panel border border-pvAccent/30 shadow-glass max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="p-4 rounded-2xl bg-pvDarker/90 border border-pvAccent/30 text-center">
            <Key className="w-8 h-8 text-pvAccent mx-auto mb-2" />
            <div className="text-sm font-bold text-white">Sender</div>
            <div className="text-xs text-slate-400 font-mono">Browser E2EE</div>
          </div>
          <div className="text-pvAccent flex justify-center rotate-90 md:rotate-0">➔</div>
          <div className="p-4 rounded-2xl bg-pvDarker/90 border border-pvAccent/30 text-center">
            <Lock className="w-8 h-8 text-pvPurple mx-auto mb-2" />
            <div className="text-sm font-bold text-white">AES-256-GCM</div>
            <div className="text-xs text-slate-400 font-mono">Payload Cipher</div>
          </div>
          <div className="text-pvAccent flex justify-center rotate-90 md:rotate-0">➔</div>
          <div className="p-4 rounded-2xl bg-pvDarker/90 border border-pvAccent/30 text-center">
            <Send className="w-8 h-8 text-pvSuccess mx-auto mb-2" />
            <div className="text-sm font-bold text-white">Receiver ID</div>
            <div className="text-xs text-slate-400 font-mono">PV-84FK2Q91</div>
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
              No need to expose email addresses. Send encrypted vaults directly to unique immutable IDs like <span className="font-mono text-pvAccent font-semibold">PV-84FK2Q91</span>.
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
