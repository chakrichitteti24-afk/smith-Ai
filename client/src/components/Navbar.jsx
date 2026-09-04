import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Code, FileText, User, Video, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Interview AI', path: '/interview', icon: Video },
    { name: 'Practice', path: '/practice', icon: Code },
    { name: 'Resume AI', path: '/resume', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2 group py-1">
          <span className="text-xl sm:text-2xl font-black brand-atlyra transition group-hover:opacity-90 tracking-tight">
            ATLYRA
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            AI Studio
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/interview' && location.pathname === '/pitching');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 shadow-xs'
                    : 'text-gray-500 hover:text-secondary hover:bg-gray-100'
                }`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right user icon */}
        <div className="flex items-center gap-2">
          <Link
            to="/interview"
            className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold"
          >
            <Sparkles size={12} /> Interview
          </Link>
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-secondary font-bold text-xs hover:bg-primary hover:text-white transition-colors"
            title="Profile"
          >
            AR
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-1.5 flex justify-around items-center shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/interview' && location.pathname === '/pitching');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-gray-400 hover:text-secondary'
              }`}
            >
              <item.icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {item.name === 'Interview AI' ? 'Interview' : item.name === 'Resume AI' ? 'Resume' : item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
