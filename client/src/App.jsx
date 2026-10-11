import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Resume from './pages/Resume';
import Profile from './pages/Profile';
import Pitching from './pages/Pitching';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-zinc-100 celestial-backdrop relative">
          <Navbar />
          <AuthModal />
          <main className="flex-grow pt-[72px] sm:pt-[84px] px-4 sm:px-6 md:px-8 lg:px-10 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12 flex flex-col w-full max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/interview" element={<Pitching />} />
              <Route path="/pitching" element={<Pitching />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
