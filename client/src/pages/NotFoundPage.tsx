import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-pvDarker flex flex-col items-center justify-center p-6 text-center">
      <MatrixBackground />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-pvAccent/10 border border-pvAccent/30 flex items-center justify-center text-pvAccent mx-auto shadow-glow-primary animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <h1 className="font-poppins text-4xl font-extrabold text-white">404 — Vault Not Found</h1>
        <p className="text-slate-400 text-sm">
          The requested page or zero-knowledge vault payload does not exist or has expired.
        </p>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-pvPrimary to-pvAccent text-white shadow-glow-primary hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Safety</span>
        </Link>
      </div>
    </div>
  );
};
