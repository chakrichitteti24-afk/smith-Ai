import React, { useState } from 'react';
import { X, Loader2, Lock, Mail, User, Shield, Briefcase, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [level, setLevel] = useState('Senior');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (authModalMode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both password fields.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        setSuccessMessage('Logged in successfully.');
      } else {
        await signup({ name: name.trim() || email.split('@')[0], email: email.trim(), password, role, level });
        setSuccessMessage('Account created successfully.');
      }
      setTimeout(() => {
        closeAuthModal();
      }, 400);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.10] bg-[#0b0d13] p-6 sm:p-7 shadow-2xl space-y-5 text-zinc-100">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {authModalMode === 'login' ? 'Sign In to Atlyra' : 'Create Candidate Account'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {authModalMode === 'login'
                ? 'Access your personalized profile & interview history'
                : 'Save your genuine challenge progress and mock evaluations'}
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl font-mono text-xs">
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Banners */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="text-zinc-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={14} className="text-zinc-300 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-8 pr-3 py-2 rounded-xl linear-input text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-8 pr-3 py-2 rounded-xl linear-input text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-9 py-2 rounded-xl linear-input text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {authModalMode === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-zinc-400">Confirm Password</label>
                {password && confirmPassword && (
                  <span className={`text-[10px] flex items-center gap-1 ${password === confirmPassword ? 'text-zinc-300' : 'text-rose-400'}`}>
                    {password === confirmPassword ? '✓ Matches' : '✕ Mismatch'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-8 pr-9 py-2 rounded-xl linear-input text-white focus:outline-none ${
                    confirmPassword && password !== confirmPassword ? 'border-rose-500/50' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Target Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                >
                  <option value="Full Stack Engineer">Full Stack</option>
                  <option value="Backend Engineer">Backend</option>
                  <option value="Frontend Engineer">Frontend</option>
                  <option value="AI / ML Engineer">AI / ML</option>
                  <option value="DevOps & Cloud Engineer">DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Seniority Level</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                >
                  <option value="Junior">Junior / Entry</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead / Staff">Lead / Staff</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-mono text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
            >
              {isLoading && <Loader2 size={13} className="animate-spin text-zinc-900" />}
              <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1 border-t border-white/[0.06]">
          <span>Secure token session (JWT)</span>
          <Link
            to={authModalMode === 'login' ? '/login' : '/signup'}
            onClick={closeAuthModal}
            className="text-zinc-400 hover:text-white transition underline underline-offset-2"
          >
            Full Page View &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
