import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FloatingActionButton: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  // Don't show FAB on /create page or public pages
  if (isPublicPage || !user || location.pathname === '/create') return null;

  return (
    <button
      onClick={() => navigate('/create')}
      title="Create New Encrypted Vault"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-pvPrimary via-pvAccent to-pvTeal text-white shadow-2xl shadow-pvAccent/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
    >
      <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
};
