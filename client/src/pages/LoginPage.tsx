import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { Lock, Mail, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { MatrixBackground } from '../components/MatrixBackground';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <div className="relative min-h-dvh min-h-screen bg-pvDarker flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <MatrixBackground />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl glass-panel border border-pvAccent/30 overflow-hidden shadow-2xl">
        {/* Left Side Visual Banner */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-pvPrimary/90 via-pvDark to-pvDarker border-r border-pvAccent/20">
          <div>
            <BrandLogo size="lg" variant="full" />
          </div>

          <div className="space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-pvAccent/20 border border-pvAccent/40 flex items-center justify-center text-pvAccent shadow-glow-primary">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-poppins text-3xl font-extrabold text-white leading-snug">
              Encrypted Vault Access
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-inter">
              Sign in to decrypt incoming files, manage User IDs, and monitor real-time transmission logs.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Zero-Knowledge Cryptographic Platform
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-pvDark/95">
          <div className="mb-8">
            <h3 className="font-poppins text-2xl font-bold text-white mb-2">Welcome Back</h3>
            <p className="text-sm text-slate-400">Enter your credentials to access your secure digital locker.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-pvDanger/10 border border-pvDanger/30 text-pvDanger text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-6 py-3 rounded-xl font-bold text-sm bg-pvDarker border border-pvAccent/30 hover:border-pvAccent text-slate-200 hover:text-white transition-all flex items-center justify-center space-x-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pvAccent/20"></div>
            </div>
            <span className="relative px-3 bg-pvDark text-xs font-semibold text-slate-500 uppercase">OR</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-pvDarker/90 border border-pvAccent/30 focus:border-pvAccent rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pvAccent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Master Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-pvDarker/90 border border-pvAccent/30 focus:border-pvAccent rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pvAccent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating & Decrypting...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-pvAccent hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
