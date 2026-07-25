import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { NotificationToastContainer } from './components/NotificationToast';
import { MatrixBackground } from './components/MatrixBackground';
import { FloatingActionButton } from './components/FloatingActionButton';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateVaultPage } from './pages/CreateVaultPage';
import { ReceivedVaultsPage } from './pages/ReceivedVaultsPage';
import { SentVaultsPage } from './pages/SentVaultsPage';
import { ActivityPage } from './pages/ActivityPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-dvh min-h-screen bg-pvDarker flex items-center justify-center text-pvAccent font-bold text-lg animate-pulse">
        Initializing WebCrypto Zero-Knowledge Environment...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <NotificationProvider>
      <div className="min-h-dvh min-h-screen bg-pvDarker text-slate-100 flex flex-col font-inter selection:bg-pvAccent selection:text-white">
        {/* Persistent Matrix Background */}
        {!isPublicPage && <MatrixBackground />}

        {!isPublicPage && <Navbar />}

        {/* Lightweight Real-time Toast Notification Container */}
        <NotificationToastContainer />

        <div className={`flex-1 flex relative z-10 ${!isPublicPage ? 'pt-16 pb-20 md:pb-0' : ''}`}>
          {/* Desktop Left Sidebar (Fixed) */}
          {!isPublicPage && user && <Sidebar />}

          <main className={`flex-1 p-4 md:p-8 overflow-y-auto ${!isPublicPage && user ? 'md:ml-64' : ''}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateVaultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/received"
                element={
                  <ProtectedRoute>
                    <ReceivedVaultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sent"
                element={
                  <ProtectedRoute>
                    <SentVaultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <ActivityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* Floating Action Plus Button */}
        {!isPublicPage && user && <FloatingActionButton />}

        {/* Mobile Floating Pill Navigation */}
        {!isPublicPage && user && <BottomNav />}
      </div>
    </NotificationProvider>
  );
};
