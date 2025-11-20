import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Mood, CoachingTip } from '../types';
import { COACHING_TIPS, MOOD_COLORS } from '../constants';

interface MiniCoachProps {
  currentMood: Mood;
  isSlouching: boolean;
  isDistracted: boolean;
  forceHydrationReminder?: boolean;
}

const MiniCoach: React.FC<MiniCoachProps> = ({ currentMood, isSlouching, isDistracted, forceHydrationReminder }) => {
  const [activeTip, setActiveTip] = useState<CoachingTip | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTip = (tip: CoachingTip) => {
    // Clear any pending dismiss
    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    setActiveTip(tip);
    setMounted(true);
    // Visibility handled by effect below for animation
    
    // Auto dismiss after 8s
    dismissTimer.current = setTimeout(handleDismiss, 8000);
  };

  const handleDismiss = () => {
    setVisible(false);
    // Unmount after exit animation
    setTimeout(() => {
      setMounted(false);
      setActiveTip(null);
    }, 300); // Match exit duration
  };

  // Animation trigger on mount
  useEffect(() => {
    if (mounted) {
      // Double RAF to ensure CSS transition catches the state change after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setVisible(true);
        });
      });
    }
  }, [mounted]);

  // Hydration Trigger
  useEffect(() => {
    if (forceHydrationReminder) {
        const hydrationTip = COACHING_TIPS.find(t => t.id === '8'); // "Hydrate!..."
        if (hydrationTip) showTip(hydrationTip);
    }
  }, [forceHydrationReminder]);

  // Standard Trigger Logic
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const triggerAdvice = () => {
      // Don't interrupt hydration reminder if it's active/forced
      if (forceHydrationReminder) return;

      let relevantTips: CoachingTip[] = [];

      if (isSlouching) {
        relevantTips = COACHING_TIPS.filter(t => t.category === 'posture');
      } else if (isDistracted) {
        relevantTips = COACHING_TIPS.filter(t => t.id === '7');
      } else {
        relevantTips = COACHING_TIPS.filter(t => t.moodTriggers.includes(currentMood));
      }

      if (relevantTips.length > 0) {
        const randomTip = relevantTips[Math.floor(Math.random() * relevantTips.length)];
        // Avoid re-triggering exact same tip repeatedly unless it's a fresh mount
        if (activeTip?.id !== randomTip.id || !mounted) {
             showTip(randomTip);
        }
      }
    };

    // Debounce triggers slightly to be less intrusive
    if (isSlouching || isDistracted || currentMood === Mood.STRESSED || currentMood === Mood.TIRED) {
       debounceTimer = setTimeout(triggerAdvice, 2000);
    }

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMood, isSlouching, isDistracted]); 

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!mounted || !activeTip) return null;

  return (
    <div className={`fixed bottom-8 right-8 max-w-sm w-full z-50 transition-all transform will-change-transform 
      ${visible 
        ? 'translate-y-0 opacity-100 scale-100 duration-700 ease-[cubic-bezier(0.2,0,0,1)]' // Smooth custom entrance
        : 'translate-y-4 opacity-0 scale-95 duration-300 ease-in' // Snappy exit
      }`}>
      
      <div 
        key={activeTip.id}
        className="glass-panel rounded-2xl p-4 shadow-2xl border-l-4 border-cyan-400 relative overflow-hidden backdrop-blur-xl bg-slate-900/90 animate-[glow_1s_ease-out_1]"
      >
        
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-slate-800 p-2 rounded-full border border-slate-700 shadow-inner flex-shrink-0 animate-[bounce_1s_1]">
            <Sparkles className={`w-5 h-5 ${MOOD_COLORS[currentMood] || 'text-cyan-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                StudySense Coach
             </h4>
             <div key={activeTip.text} className="animate-[pulse_0.5s_ease-out_1]">
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  "{activeTip.text}"
                </p>
             </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniCoach;