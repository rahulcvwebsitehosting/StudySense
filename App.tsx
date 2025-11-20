import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, BarChart2, BrainCircuit, Linkedin, User } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Summary from './pages/Summary';
import About from './pages/About';
import LinkedinRedirect from './pages/LinkedinRedirect';
import VoiceNoteTaker from './components/VoiceNoteTaker';
import AppSupportChat from './components/AppSupportChat';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  // Hide nav on active session to minimize distractions
  if (location.pathname === '/session') return null;

  const navItemClass = (path: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
      location.pathname === path 
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
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
      
      {/* LinkedIn Link (Redirects via special page) */}
      <div className="w-[100px] flex justify-end">
        <Link
          to="/linkedin-redirect"
          className="p-2 text-slate-400 hover:text-[#0A66C2] transition-colors hover:bg-slate-800 rounded-full relative group"
          title="Developer LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
          <span className="absolute right-0 top-full mt-2 w-max px-2 py-1 text-[10px] bg-slate-800 border border-slate-700 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
             Connect
          </span>
        </Link>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen text-slate-200 selection:bg-cyan-500/30 font-sans bg-slate-900">
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