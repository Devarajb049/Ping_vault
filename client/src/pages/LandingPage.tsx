import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Send,
  Eye,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  Key,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';
import { BrandLogo } from '../components/BrandLogo';
import { PageTransition } from '../components/PageTransition';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const [simulatedText, setSimulatedText] = useState('Confidential API secret token: sk_live_99218');
  const [isEncrypted, setIsEncrypted] = useState(false);

  const toggleSimulatedEncryption = () => {
    setIsEncrypted(!isEncrypted);
  };

  return (
    <PageTransition className="relative min-h-screen text-slate-100 bg-pvBg overflow-hidden">
      <MatrixBackground />

      {/* Header / Nav */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <header className="px-5 sm:px-8 py-4 rounded-2xl bg-slate-900/80 dark:bg-pvBg/80 backdrop-blur-2xl border border-slate-800 dark:border-white/10 shadow-2xl flex items-center justify-between gap-2 transition-all">
          <BrandLogo size="md" variant="full" />
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 dark:border-white/10 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 transition-all"
            >
              Start Free
            </Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-pvPrimary/15 border border-pvPrimary/30 text-pvPrimary text-xs font-bold uppercase tracking-wider mb-8">
          <Zap className="w-4 h-4 text-pvPrimary flex-shrink-0" />
          <span>Zero-Knowledge Multi-Recipient E2EE Engine</span>
        </div>

        <h1 className="font-jakarta text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Enterprise Zero-Knowledge <br />
          <span className="bg-gradient-to-r from-pvPrimary via-pvSecondary to-pvPurple bg-clip-text text-transparent">
            Encrypted Vault Sharing
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-sans">
          Store, encrypt, and transmit confidential notes, passwords, and multi-format files directly to recipient User IDs using browser WebCrypto RSA-2048 & AES-256-GCM encryption with complete control over view limits and self-destruct timers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-pvPrimary text-white shadow-glow-primary hover:scale-105 transition-all flex items-center justify-center space-x-3"
          >
            <span>Create Encrypted Vault</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-slate-900/80 border border-slate-800 dark:border-white/10 text-slate-200 hover:bg-slate-900 transition-all"
          >
            Access Vault Dashboard
          </Link>
        </div>

        {/* Live Interactive Encryption Sandbox Simulation */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 dark:border-white/10 shadow-2xl max-w-3xl mx-auto text-left space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-pvPrimary" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                WebCrypto Browser Encryption Sandbox
              </span>
            </div>
            <button
              onClick={toggleSimulatedEncryption}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-pvPrimary/20 text-pvPrimary border border-pvPrimary/40 hover:bg-pvPrimary/30 transition-all flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEncrypted ? 'Decrypt Payload' : 'Encrypt Payload'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Payload Buffer ({isEncrypted ? 'AES-256-GCM Ciphertext' : 'Plaintext Secret'})
            </label>
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-pvPrimary leading-relaxed break-all">
              {isEncrypted
                ? 'u7G3k9L+q1v/RSA-OAEP+AES256GCM==9981A7F2BC0019284712093847102938471092384710293847192837491827349182734918'
                : simulatedText}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 font-mono">
            <span className="flex items-center space-x-1 text-pvSuccess">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Server-Side Exposure</span>
            </span>
            <span>RSA-2048 / SHA-256</span>
          </div>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-white">
            Enterprise Security Architecture
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Architected strictly for confidentiality, zero-knowledge key generation, and seamless compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pvPrimary/15 border border-pvPrimary/30 flex items-center justify-center text-pvPrimary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Receiver ID Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transmit encrypted payloads directly to unique immutable User IDs like <span className="font-mono text-pvPrimary font-bold">deva1280</span> without exposing email or phone data.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pvPurple/15 border border-pvPurple/30 flex items-center justify-center text-pvPurple">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Recipient E2EE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encrypt vault symmetric key using RSA-2048 public keys of multiple recipients simultaneously inside the sender's browser.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pvSuccess/15 border border-pvSuccess/30 flex items-center justify-center text-pvSuccess">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Self-Destruct Timers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforce time-based expiration (e.g. 24 hours) or view-based limits (e.g. 1 view self-destruct) for absolute payload lifecycle control.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Ping Vault Platform. All rights reserved. Zero-Knowledge E2EE Architecture.</p>
      </footer>
    </PageTransition>
  );
};
