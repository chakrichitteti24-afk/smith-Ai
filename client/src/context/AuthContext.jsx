import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, fetchCurrentUser, updateUserProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Verify and fetch current user profile on initial load if token exists
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.ok && res.user) {
            setUser(res.user);
            localStorage.setItem('auth_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification notice:', err.message);
          // Keep cached user if offline, or clear if 401
          if (err.message && err.message.includes('401')) {
            logout();
          }
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.ok && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      // Also sync candidate_profile in localStorage so other components reflect user identity
      localStorage.setItem('candidate_profile', JSON.stringify({
        name: res.user.name,
        email: res.user.email,
        title: res.user.role || 'Full Stack Engineer',
        level: res.user.level || 'Mid Level',
        location: res.user.location || '',
        targetCompanies: res.user.targetCompanies || '',
        bio: res.user.bio || ''
      }));
      setIsAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signup = async ({ name, email, password, role, level, difficulty }) => {
    const res = await signupUser({ name, email, password, role, level, difficulty });
    if (res.ok && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      localStorage.setItem('candidate_profile', JSON.stringify({
        name: res.user.name,
        email: res.user.email,
        title: res.user.role || 'Full Stack Engineer',
        level: res.user.level || 'Mid Level',
        location: '',
        targetCompanies: '',
        bio: ''
      }));
      setIsAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (updates) => {
    if (!token) {
      // Local-only update if not authenticated
      setUser(prev => {
        const next = { ...(prev || {}), ...updates };
        localStorage.setItem('auth_user', JSON.stringify(next));
        return next;
      });
      return updates;
    }

    const res = await updateUserProfile(updates);
    if (res.ok && res.user) {
      setUser(res.user);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      return res.user;
    }
    return updates;
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
