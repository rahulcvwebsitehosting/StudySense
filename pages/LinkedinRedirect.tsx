import React, { useEffect, useState, useRef } from 'react';
import { Linkedin, ArrowRight, X, Loader2, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DURATION_MS = 20000; // 20 seconds

const LinkedinRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_MS / 1000);
  const [isExiting, setIsExiting] = useState(false);
  
  // Monotonic timer refs
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const LINKEDIN_URL = "https://www.linkedin.com/in/rahulshyamcivil";

  // Start Timer
  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      const secs = Math.ceil(remaining / 1000);

      setSecondsRemaining(secs);

      if (remaining <= 0) {
        handleTimeout();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Verify Timer Precision (Dev Mode Assertion)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && secondsRemaining === 0 && startTimeRef.current) {
        const actualDuration = Date.now() - startTimeRef.current;
        const diff = Math.abs(actualDuration - DURATION_MS);
        console.log(`%c[Timer Check] Target: 20000ms, Actual: ${actualDuration}ms, Error: ${diff}ms`, 'color: #00ff00; font-weight: bold');
    }
  }, [secondsRemaining]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsExiting(true);

    // Graceful exit after short animation
    setTimeout(() => {
       // If opened in a new window/tab via window.open
       if (window.opener && !window.opener.closed) {
         window.close();
       } 
       // If navigated in-app, go back
       else if (window.history.length > 1) {
         navigate(-1);
       } 
       // Fallback
       else {
         navigate('/');
       }
    }, 800); 
  };

  const handleProceed = () => {
    window.open(LINKEDIN_URL, '_blank');
    // We don't auto-close immediately on click to allow them to return if needed, 
    // but the timer will eventually close it.
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* ARIA Live Region for Timer */}
      <div role="timer" aria-live="polite" className="sr-only">
        Redirect page closing in {secondsRemaining} seconds.
      </div>

      <div className={`glass-panel p-10 rounded-3xl max-w-lg w-full text-center border border-slate-700/50 shadow-2xl relative z-10 transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'animate-[scaleIn_0.3s_ease-out]'}`}>
        
        <div className="w-20 h-20 bg-[#0A66C2] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-900/30 animate-[bounce_2s_infinite]">
          <Linkedin className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Built by Rahul Shyam</h1>
        <p className="text-slate-400 mb-8">
          This app was designed and developed by Rahul. Connect on LinkedIn to see more projects.
        </p>

        <div className="mb-8 relative inline-block">
           <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-500 tabular-nums">
             {secondsRemaining}
           </div>
           <div className="text-xs text-slate-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
             <Timer className="w-3 h-3" /> Closing in...
           </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleProceed}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold transition-all hover:scale-[1.02] shadow-xl"
          >
            Proceed to LinkedIn <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto py-2"
          >
            <X className="w-3 h-3" /> Cancel and Go Back
          </button>
        </div>

        {/* Exit Toast Overlay */}
        {isExiting && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-3xl animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-3 text-cyan-400 font-bold">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 Returning to previous page...
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default LinkedinRedirect;