import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Shield,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AtlyraSymbol from '../components/AtlyraSymbol';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ initialMode = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, signup } = useAuth();

  // Mode: 'login' | 'signup'
  const targetMode = initialMode || (location.pathname.includes('signup') ? 'signup' : 'login');
  const [mode, setMode] = useState(targetMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [level, setLevel] = useState('Senior');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/interview';

  // Sync mode if initialMode prop or path changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    } else if (location.pathname.includes('signup')) {
      setMode('signup');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [initialMode, location.pathname]);

  // If already authenticated, redirect seamlessly
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  // Dynamic Password Matching Telemetry
  const passwordsMatch = useMemo(() => {
    if (!password || !confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Dynamic Password Strength Meter
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-zinc-700' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 33, label: 'Basic', color: 'bg-zinc-400' };
    if (score <= 4) return { score: 66, label: 'Strong', color: 'bg-zinc-200' };
    return { score: 100, label: 'Enterprise Grade', color: 'bg-white' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
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
      if (mode === 'login') {
        await login(email, password);
        setSuccessMessage('Authentication successful! Launching session...');
      } else {
        await signup({
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          password,
          role,
          level
        });
        setSuccessMessage('Candidate profile registered! Launching session...');
      }

      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-6 sm:py-10 max-w-xl mx-auto w-full relative font-sans text-zinc-100 animate-fadeIn">
      
      {/* Dynamic Ambient Monochrome Field */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-white/[0.08] via-zinc-400/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none -z-10 transition-all duration-700 ease-out" />

      {/* Top Floating Telemetry Capsule */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400 mb-6 shadow-sm backdrop-blur-xl">
        <AtlyraSymbol size={14} withGlow animated />
        <span className="text-zinc-200 font-medium">Smith AI</span>
        <span className="text-zinc-600">&bull;</span>
        <span className="text-zinc-400">Candidate Gateway</span>
      </div>

      {/* Main Dynamic Obsidian Card */}
      <div className="relative w-full rounded-3xl border border-white/[0.10] bg-[#0b0d13]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Title & Pitch */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {mode === 'login' ? 'Sign in to Smith AI' : 'Create Candidate Account'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto font-normal">
            {mode === 'login'
              ? 'Access real-time voice interview evaluations, code sandbox progress, and ATS dossiers.'
              : 'Sign up to launch official 45-minute technical mock assessments and save your evaluations.'}
          </p>
        </div>

        {/* Dynamic Mode Switcher Tab */}
        <div className="flex p-1 bg-white/[0.03] border border-white/[0.07] rounded-full font-mono text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-full transition-all duration-200 font-medium cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-zinc-950 font-semibold shadow-glow-white scale-101'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-full transition-all duration-200 font-medium cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-zinc-950 font-semibold shadow-glow-white scale-101'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Dynamic Alert Banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-zinc-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-zinc-500 hover:text-white text-xs cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-2.5 shadow-lg animate-fadeIn">
            <CheckCircle2 size={15} className="text-zinc-300 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          
          {/* Optional Name Field for Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                Candidate Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl linear-input text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
              Email Address <span className="text-white">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl linear-input text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-zinc-400 uppercase tracking-wider">
                Password <span className="text-white">*</span>
              </label>
              {mode === 'signup' && password && (
                <span className="text-[10px] text-zinc-400 font-mono">
                  {passwordStrength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl linear-input text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Dynamic Password Strength Indicator Bar */}
            {mode === 'signup' && password && (
              <div className="mt-1.5 space-y-1">
                <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (REQUIRED ON SIGNUP) */}
          {mode === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider">
                  Confirm Password <span className="text-white">*</span>
                </label>
                {passwordsMatch !== null && (
                  <span className={`text-[10px] font-mono flex items-center gap-1 ${
                    passwordsMatch ? 'text-zinc-200' : 'text-zinc-400'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <Check size={11} className="text-zinc-200" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <span>Passwords do not match</span>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl linear-input text-white placeholder-zinc-500 focus:outline-none transition ${
                    passwordsMatch === false && confirmPassword.length > 0
                      ? 'border-zinc-500 focus:border-zinc-400'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-white transition cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Target Role & Seniority Preferences for Signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none cursor-pointer"
                >
                  <option value="Full Stack Engineer">Full Stack</option>
                  <option value="Backend Engineer">Backend</option>
                  <option value="Frontend Engineer">Frontend</option>
                  <option value="AI / ML Engineer">AI / ML</option>
                  <option value="DevOps & Cloud Engineer">DevOps</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Seniority Level
                </label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none cursor-pointer"
                >
                  <option value="Junior">Junior / Entry</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead / Staff">Lead / Staff</option>
                </select>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || (mode === 'signup' && passwordsMatch === false)}
              className="w-full py-3 rounded-full linear-btn-primary font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-glow-white active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{mode === 'login' ? 'Sign In & Launch Simulation' : 'Register Candidate Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-zinc-400" />
            <span>MongoDB Atlas Persistent Profile</span>
          </span>
          <span className="text-zinc-400">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(''); }}
                className="underline underline-offset-4 hover:text-white cursor-pointer"
              >
                Need an account?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="underline underline-offset-4 hover:text-white cursor-pointer"
              >
                Already have an account?
              </button>
            )}
          </span>
        </div>

      </div>

      {/* Whisper-Quiet Bottom Telemetry */}
      <div className="mt-8 text-center text-xs font-mono text-zinc-500">
        <span>Smith AI Autonomous Evaluator &bull; Developed by </span>
        <a
          href="https://cipherflux-labs.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-300 font-semibold hover:text-white underline underline-offset-4 decoration-white/20"
        >
          CipherFlux Labs
        </a>
      </div>

    </div>
  );
}
