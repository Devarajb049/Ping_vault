import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CryptoClient } from '../utils/cryptoClient';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  receiverId: string;
  publicKey: string;
  encryptedPrivateKey: string;
  salt: string;
  role: 'user' | 'admin';
  securityScore: number;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  privateKeyPEM: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, username: string, email: string, pass: string) => Promise<{ receiverId: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global Axios Interceptor to attach Bearer Token if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('pv_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [privateKeyPEM, setPrivateKeyPEM] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Handle token passed in URL query parameter from Google OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          localStorage.setItem('pv_token', urlToken);
          // Clean token from URL bar without triggering page refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const res = await axios.get('/api/v1/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          const savedPrivKey = localStorage.getItem(`pv_priv_${res.data.data.receiverId}`);
          if (savedPrivKey) {
            setPrivateKeyPEM(savedPrivKey);
          }
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await axios.post('/api/v1/auth/login', { email, password: pass });
    if (res.data.success) {
      const u = res.data.data.user;
      const token = res.data.data.tokens?.accessToken;
      if (token) {
        localStorage.setItem('pv_token', token);
      }
      setUser(u);
      const savedPrivKey = localStorage.getItem(`pv_priv_${u.receiverId}`) || u.encryptedPrivateKey;
      setPrivateKeyPEM(savedPrivKey);
      localStorage.setItem(`pv_priv_${u.receiverId}`, savedPrivKey);
    } else {
      throw new Error(res.data.message || 'Login failed');
    }
  };

  const register = async (fullName: string, username: string, email: string, pass: string) => {
    // 1. Generate RSA Key Pair in browser via WebCrypto API
    const { publicKeyPEM, privateKeyPEM, salt } = await CryptoClient.generateKeyPair();

    const res = await axios.post('/api/v1/auth/register', {
      fullName,
      username,
      email,
      password: pass,
      publicKey: publicKeyPEM,
      encryptedPrivateKey: privateKeyPEM,
      salt,
    });

    if (res.data.success) {
      const u = res.data.data.user;
      const token = res.data.data.tokens?.accessToken;
      if (token) {
        localStorage.setItem('pv_token', token);
      }
      setUser(u);
      setPrivateKeyPEM(privateKeyPEM);
      localStorage.setItem(`pv_priv_${u.receiverId}`, privateKeyPEM);
      return { receiverId: u.receiverId };
    } else {
      throw new Error(res.data.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (e) {}
    if (user?.receiverId) {
      localStorage.removeItem(`pv_priv_${user.receiverId}`);
    }
    localStorage.removeItem('pv_token');
    setUser(null);
    setPrivateKeyPEM(null);
  };


  return (
    <AuthContext.Provider value={{ user, privateKeyPEM, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
