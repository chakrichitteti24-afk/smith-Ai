import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Terminal, FileCode2, User, Mic2, Sparkles, Activity } from 'lucide-react';
import AtlyraSymbol from './AtlyraSymbol';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Interview', path: '/interview', icon: Mic2 },
    { name: 'Practice', path: '/practice', icon: Terminal },
    { name: 'Resume', path: '/resume', icon: FileCode2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const [initials, setInitials] = React.useState('AR');

  React.useEffect(() => {
    try {
      const p = localStorage.getItem('candidate_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.name) {
          const init = parsed.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          if (init) setInitials(init);
        }
      }
    } catch {}
  }, [location.pathname]);

  return (
    <>
      {/* Top Floating Minimal Navigation Bar */}
      <header className="fixed w-full top-0 z-50 px-3 sm:px-6 md:px-8 pointer-events-none" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto bg-[#090a0f]/85 backdrop-blur-xl border border-white/[0.08] px-3.5 sm:px-5 py-2.5 rounded-full transition-all">
          
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

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <Link
              to="/interview"
              className="linear-btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-medium tracking-tight rounded-full cursor-pointer shadow-sm"
            >
              <span>Start Interview</span>
            </Link>

            <Link
              to="/profile"
              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300 font-mono text-[11px] hover:text-white hover:border-white/20 transition-all"
              title="Profile"
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090a0f]/92 backdrop-blur-xl border-t border-white/[0.07] flex justify-around items-center px-1"
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
