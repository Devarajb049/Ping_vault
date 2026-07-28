import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';
import { PageTransition } from '../components/PageTransition';

export const NotFoundPage: React.FC = () => {
  return (
    <PageTransition className="relative min-h-screen bg-pvBg flex flex-col items-center justify-center p-6 text-center">
      <MatrixBackground />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-pvPrimary/20 border border-pvPrimary/40 flex items-center justify-center text-pvPrimary mx-auto shadow-glow-primary animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h1 className="font-jakarta text-4xl font-extrabold text-white">404 — Vault Not Found</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          The requested route or zero-knowledge vault payload does not exist or has expired.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </PageTransition>
  );
};
