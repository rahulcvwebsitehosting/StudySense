
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, StopCircle, GlassWater, AlertCircle, Maximize2, Eye, Brain, Activity, X } from 'lucide-react';
import WebcamMonitor from '../components/WebcamMonitor';
import MiniCoach from '../components/MiniCoach';
import { Mood, FaceDetectionState, SessionData, SessionMetric } from '../types';
import { faceService } from '../services/faceService';
import { saveSession } from '../services/storage';
import { MOOD_COLORS } from '../constants';

const Session: React.FC = () => {
  const navigate = useNavigate();
  
  // Session State
  const [isActive, setIsActive] = useState(true);
  const [elapsed, setElapsed] = useState(0); // Display time in seconds
  
  // Timer Logic: Store timestamps to survive background tab throttling
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  const [accumulatedTime, setAccumulatedTime] = useState(0); // Time stored from previous pause segments

  // Metrics
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetric[]>([]);
  const [waterCount, setWaterCount] = useState(0);
  const [postureWarnings, setPostureWarnings] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  
  // Hydration Reminder State
  const [waterInterval, setWaterInterval] = useState(30); // Default 30 mins
  const [lastDrinkTime, setLastDrinkTime] = useState(Date.now());
  const [hydrationReminderActive, setHydrationReminderActive] = useState(false);

  // AI State - Refs are used to access latest state inside intervals without triggering re-renders
  const [faceState, setFaceState] = useState<FaceDetectionState>({
    isLoaded: false, isDetecting: false, mood: Mood.NEUTRAL, 
    score: 0, slouchDetected: false, distracted: false
  });
  const faceStateRef = useRef(faceState);

  // Refs for cumulative counters (avoids dependency issues in intervals)
  const focusTimeRef = useRef(0);
  const distractedTimeRef = useRef(0);

  // Keep ref in sync with state
  useEffect(() => {
    faceStateRef.current = faceState;
  }, [faceState]);

  // Toggle Pause/Play
  const toggleSession = () => {
    if (isActive) {
      // Pausing: Calculate time spent in current segment and add to accumulated
      if (startTime) {
        const currentSegment = Date.now() - startTime;
        setAccumulatedTime(prev => prev + currentSegment);
      }
      setStartTime(null);
      setIsActive(false);
    } else {
      // Resuming: Reset start time
      setStartTime(Date.now());
      setIsActive(true);
    }
  };

  // Main Session Loop (Timer + Sampling)
  useEffect(() => {
    let interval: any;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        
        // 1. Update Timer (Delta Calculation)
        // elapsed = accumulated (past) + current segment (now - start)
        const currentSegmentDuration = now - startTime;
        const totalElapsedMs = accumulatedTime + currentSegmentDuration;
        setElapsed(Math.floor(totalElapsedMs / 1000));

        // 2. Sampling Logic (Runs at 1Hz)
        // We access the Ref to get the very latest face state without stale closures
        const currentFace = faceStateRef.current;
        
        // Update Time Counters
        if (currentFace.distracted || currentFace.slouchDetected) {
          distractedTimeRef.current += 1;
        } else {
          focusTimeRef.current += 1;
        }

        // Store Metric - This ensures every second is captured for aggregation
        setSessionMetrics(prev => [...prev, {
             timestamp: now,
             mood: currentFace.mood || Mood.NEUTRAL,
             isSlouching: !!currentFace.slouchDetected,
             isDistracted: !!currentFace.distracted
        }]);

        // 3. Hydration Check
        if (waterInterval > 0) {
            const timeSinceDrink = now - lastDrinkTime;
            if (timeSinceDrink > waterInterval * 60 * 1000 && !hydrationReminderActive) {
                setHydrationReminderActive(true);
            }
        }

      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, startTime, accumulatedTime, waterInterval, lastDrinkTime, hydrationReminderActive]);

  // Separate Posture Check Effect (Immediate Feedback)
  useEffect(() => {
    if (faceState.slouchDetected && isActive) {
      setPostureWarnings(prev => prev + 1);
    }
  }, [faceState.slouchDetected, isActive]);

  const handleStop = () => {
    setIsActive(false);
    
    // Final time calculation
    const now = Date.now();
    const currentSegment = (isActive && startTime) ? (now - startTime) : 0;
    const totalMs = accumulatedTime + currentSegment;
    const totalDuration = Math.floor(totalMs / 1000);

    const focusRatio = totalDuration > 0 ? (focusTimeRef.current / totalDuration) : 0;
    let score = Math.round(focusRatio * 100);
    score -= (postureWarnings * 0.5); 
    score = Math.max(0, Math.min(100, score));

    const sessionData: SessionData = {
      id: crypto.randomUUID(),
      startTime: (startTime || now) - totalMs, // approximate start
      endTime: now,
      totalDuration,
      focusTime: focusTimeRef.current,
      distractedTime: distractedTimeRef.current,
      postureWarnings,
      waterDrank: waterCount,
      moodHistory: sessionMetrics,
      finalFocusScore: score
    };

    saveSession(sessionData);
    navigate('/summary', { state: { session: sessionData } });
  };

  const handleLogWater = () => {
    setWaterCount(p => p + 1);
    setLastDrinkTime(Date.now());
    setHydrationReminderActive(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-slate-900/50 backdrop-blur-md">
        <div>
          <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">Session Active</div>
          <div className="text-4xl font-mono font-bold tabular-nums tracking-tight">{formatTimer(elapsed)}</div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setShowDebug(!showDebug)} className="p-3 rounded-full text-slate-500 hover:bg-slate-800" title="Toggle Debug View">
              <Activity className="w-6 h-6" />
           </button>
           <button 
            onClick={toggleSession}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
           >
             {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
           </button>
           <button 
            onClick={handleStop}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 transition-all"
           >
             <StopCircle className="w-5 h-5" />
             <span className="font-bold">End Session</span>
           </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {/* Mood Card */}
          <div className={`glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-h-[120px] transition-all duration-500 border-slate-700`}>
            <span className="text-xs text-slate-400 uppercase font-bold mb-2">Current Mood</span>
            <div className={`text-2xl font-bold capitalize ${MOOD_COLORS[faceState.mood] || 'text-white'}`}>
              {faceState.isDetecting ? faceState.mood.toLowerCase() : 'Detecting...'}
            </div>
          </div>

          {/* Posture Card */}
          <div className={`glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-h-[120px] transition-all ${faceState.slouchDetected ? 'animate-pulse border-orange-500/50 bg-orange-500/10' : ''}`}>
            <span className="text-xs text-slate-400 uppercase font-bold mb-2">Posture</span>
            <div className={`text-xl font-bold flex items-center gap-2 ${faceState.slouchDetected ? 'text-orange-400' : 'text-emerald-400'}`}>
              {faceState.slouchDetected ? (
                <><AlertCircle className="w-5 h-5" /> Slouching</>
              ) : (
                <><Maximize2 className="w-5 h-5" /> Good</>
              )}
            </div>
          </div>

          {/* Focus Card */}
          <div className={`glass-panel p-4 rounded-2xl flex flex-col items-center justify-center min-h-[120px] ${faceState.distracted ? 'border-yellow-500/50 bg-yellow-500/10' : ''}`}>
             <span className="text-xs text-slate-400 uppercase font-bold mb-2">Attention</span>
             <div className={`text-xl font-bold flex items-center gap-2 ${faceState.distracted ? 'text-yellow-400' : 'text-blue-400'}`}>
               {faceState.distracted ? <Eye className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
               {faceState.distracted ? 'Distracted' : 'Focused'}
             </div>
          </div>

          {/* Water Card */}
          <div className="glass-panel rounded-2xl relative overflow-hidden flex flex-col min-h-[120px] hover:bg-cyan-500/5 transition-all group">
             <button 
                onClick={handleLogWater}
                className="flex-1 w-full p-4 flex flex-col items-center justify-center cursor-pointer focus:outline-none"
             >
                <span className="text-xs text-slate-400 uppercase font-bold mb-2">Hydration</span>
                <div className="flex items-center gap-2">
                   <GlassWater className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${hydrationReminderActive ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                   <span className="text-2xl font-bold text-white">{waterCount}</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Click to log</span>
             </button>

             {/* Interval Settings */}
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <select 
                   value={waterInterval} 
                   onChange={(e) => setWaterInterval(Number(e.target.value))}
                   className="bg-slate-900/80 text-[10px] text-slate-400 border border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500 cursor-pointer hover:text-cyan-400 appearance-none text-center min-w-[40px]"
                   title="Set hydration reminder interval"
                >
                   <option value={0}>Off</option>
                   <option value={15}>15m</option>
                   <option value={30}>30m</option>
                   <option value={45}>45m</option>
                   <option value={60}>60m</option>
                </select>
             </div>
          </div>
        </div>

        <WebcamMonitor 
          onUpdate={setFaceState} 
          onCalibrate={() => faceService.calibrateToCurrent()} 
        />
      </div>

      {/* Debug Overlay */}
      {showDebug && faceState.debug && (
        <div className="fixed top-20 left-6 p-4 bg-black/80 backdrop-blur border border-slate-700 rounded-xl text-xs font-mono z-50 text-slate-300 w-64">
            <div className="flex justify-between mb-2">
                <strong className="text-white">Debug Metrics</strong>
                <button onClick={() => setShowDebug(false)}><X className="w-3 h-3"/></button>
            </div>
            <div className="space-y-1">
                <div className="text-cyan-400 font-bold">Heuristics:</div>
                <div>Blink Rate: {Math.round(faceState.debug.heuristics.blinkRate)} bpm</div>
                <div>Smile: {faceState.debug.heuristics.smileCurvature.toFixed(3)}</div>
                <div>Mouth Open: {faceState.debug.heuristics.mouthOpenness.toFixed(3)}</div>
                <div>Brow Lower: {faceState.debug.heuristics.browLowering.toFixed(3)}</div>
                <div className="mt-2 text-cyan-400 font-bold">Expressions:</div>
                {Object.entries(faceState.debug.expressions).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                        <span>{k}:</span>
                        <span>{(v as number).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      <MiniCoach 
        currentMood={faceState.mood}
        isSlouching={faceState.slouchDetected}
        isDistracted={faceState.distracted}
        forceHydrationReminder={hydrationReminderActive}
      />
    </div>
  );
};

export default Session;
