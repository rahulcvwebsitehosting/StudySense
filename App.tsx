import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, BarChart2, BrainCircuit, Linkedin, User, Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Summary from './pages/Summary';
import About from './pages/About';
import LinkedinRedirect from './pages/LinkedinRedirect';
import VoiceNoteTaker from './components/VoiceNoteTaker';
import AppSupportChat from './components/AppSupportChat';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sync state with current DOM class on mount
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };
  
  // Hide nav on active session to minimize distractions
  if (location.pathname === '/session') return null;

  const navItemClass = (path: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
      location.pathname === path 
      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' 
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          StudySense
        </span>
      </div>

      <div className="flex gap-2">
        <Link to="/" className={navItemClass('/')}>
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">Dashboard</span>
        </Link>
        <Link to="/summary" className={navItemClass('/summary')}>
          <BarChart2 className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">History</span>
        </Link>
        <Link to="/about" className={navItemClass('/about')}>
          <User className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">About</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* LinkedIn Link (Redirects via special page) */}
        <div className="w-[40px] flex justify-end">
          <Link
            to="/linkedin-redirect"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#0A66C2] transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full relative group"
            title="Developer LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  // Initialize theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    
    if (savedTheme === 'light') {
      html.classList.remove('dark');
    } else {
      // Default to dark if not set or set to dark
      html.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Navigation />
        <div className="pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/about" element={<About />} />
            <Route path="/linkedin-redirect" element={<LinkedinRedirect />} />
          </Routes>
        </div>
        <VoiceNoteTaker />
        <AppSupportChat />
      </div>
    </Router>
  );
};

export default App;