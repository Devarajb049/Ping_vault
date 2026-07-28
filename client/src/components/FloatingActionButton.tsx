import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  return (
    <Link
      to="/create"
      className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-30 group flex items-center space-x-2 bg-gradient-to-r from-pvPrimary via-pvSecondary to-pvPrimary text-white p-4 md:px-5 md:py-3.5 rounded-2xl shadow-glow-primary hover:shadow-glow-accent transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
      title="Create New Encrypted Vault"
    >
      <div className="relative">
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <Shield className="w-3 h-3 absolute -top-1 -right-1 text-amber-300" />
      </div>
      <span className="hidden md:inline font-bold text-sm tracking-wide">New Vault</span>
    </Link>
  );
};
