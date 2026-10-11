import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

export const metadata = {
  title: 'Smith AI — Enterprise AI Technical Interview Platform',
  description: 'AI-powered mock technical, coding, and behavioral interviews with voice analysis and ATS intelligence.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#07080c] text-zinc-100 celestial-backdrop relative antialiased selection:bg-white/10 selection:text-white">
        <AuthProvider>
          <div className="min-h-screen flex flex-col relative w-full">
            <Navbar />
            <AuthModal />
            <main className="flex-grow pt-[72px] sm:pt-[84px] px-4 sm:px-6 md:px-8 lg:px-10 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12 flex flex-col w-full max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
