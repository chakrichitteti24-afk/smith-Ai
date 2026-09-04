import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Resume from './pages/Resume';
import Profile from './pages/Profile';
import Pitching from './pages/Pitching';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16 sm:pt-20 md:pt-24 px-3 sm:px-6 md:px-8 pb-24 md:pb-8 flex flex-col w-full max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interview" element={<Pitching />} />
            <Route path="/pitching" element={<Pitching />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
