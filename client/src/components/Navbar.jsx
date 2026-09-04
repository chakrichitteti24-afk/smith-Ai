import { Link, useLocation } from 'react-router-dom';
import { Home, Code, FileText, User, Video } from 'lucide-react';

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
    <nav className="fixed w-full top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center group py-1">
        <span className="text-2xl font-black brand-atlyra transition group-hover:opacity-90">
          ATLYRA
        </span>
      </Link>
      <div className="flex gap-6">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/interview' && location.pathname === '/pitching');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 font-medium transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-gray-500 hover:text-secondary'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>
      <Link to="/profile" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-secondary font-bold hover:bg-primary hover:text-white transition-colors">
        U
      </Link>
    </nav>
  );
}
