import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Terminal, FileCode2, User, Mic2, LogOut, LogIn } from 'lucide-react';
import AtlyraSymbol from './AtlyraSymbol';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Interview', path: '/interview', icon: Mic2 },
    { name: 'Practice', path: '/practice', icon: Terminal },
    { name: 'Resume', path: '/resume', icon: FileCode2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (localStorage.getItem('candidate_profile') ? JSON.parse(localStorage.getItem('candidate_profile') || '{}').name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : null);

  return (
    <>
      {/* Top Floating Minimal Navigation Bar */}
      <header className="fixed w-full top-0 z-50 px-3 sm:px-6 md:px-8 pointer-events-none" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto bg-[#090a0f]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 sm:px-5 py-2.5 rounded-full transition-all shadow-xl">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <AtlyraSymbol size={22} withGlow />
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-zinc-200 transition">
              Atlyra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === '/interview' && location.pathname === '/pitching');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <item.icon size={13} className={isActive ? 'text-white' : 'text-zinc-500'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={isAuthenticated ? "/interview" : "/signup?redirect=/interview"}
              className="px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-medium tracking-tight rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition cursor-pointer shadow-sm"
            >
              <span>Start Interview</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.12] flex items-center justify-center text-zinc-200 font-mono text-[11px] hover:text-white hover:border-white/30 transition-all cursor-pointer"
                  title={user?.name || 'Account'}
                >
                  {initials || 'U'}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.10] bg-[#0b0d13] p-1.5 shadow-2xl font-mono text-xs z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="font-semibold text-white truncate">{user?.name || 'Candidate'}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email || ''}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.05] transition"
                    >
                      <User size={13} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setIsDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={12} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/[0.07] flex justify-around items-center px-1"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))', paddingTop: '0.5rem' }}
      >
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/interview' && location.pathname === '/pitching');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-white font-medium bg-white/[0.08]' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-white' : 'text-zinc-500'} />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
