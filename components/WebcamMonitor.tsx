import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, RefreshCw, AlertTriangle, User, CheckCircle2, Wifi, Video } from 'lucide-react';
import { faceService } from '../services/faceService';
import { FaceDetectionState, Mood } from '../types';

interface WebcamMonitorProps {
  onUpdate: (state: FaceDetectionState) => void;
  onCalibrate?: () => void;
}

const WebcamMonitor: React.FC<WebcamMonitorProps> = ({ onUpdate, onCalibrate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>('Preparing...');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [errorType, setErrorType] = useState<'network' | 'permission' | 'unknown'>('unknown');
  const [manualMode, setManualMode] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  
  // Track manual state to persist it between updates
  const [manualState, setManualState] = useState({
    mood: Mood.NEUTRAL,
    slouchDetected: false,
    distracted: false
  });

  useEffect(() => {
    if (manualMode) return;

    let stream: MediaStream | null = null;
    let intervalId: any;
    let isMounted = true;

    const startCamera = async () => {
      try {
        setIsInitializing(true);
        setErrorMsg('');
        setHasPermission(null);
        setErrorType('unknown');

        // 1. Load Models
        setLoadingStage('Initializing AI Models (1/2)...');
        await faceService.loadModels();

        // 2. Get User Media
        setLoadingStage('Accessing Camera (2/2)...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, facingMode: 'user' } 
        });
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          // Wait for video to actually play data
          videoRef.current.onloadedmetadata = () => {
             if (!isMounted) return;
             videoRef.current?.play();
             setHasPermission(true);
             setIsInitializing(false);
             
             // Start Detection Loop
             startDetectionLoop();
          };
        }
      } catch (err: any) {
        console.error("Camera/Model Error:", err);
        if (!isMounted) return;

        setHasPermission(false);
        setIsInitializing(false);
        
        let msg = 'Connection Failed.';
        let type: 'network' | 'permission' | 'unknown' = 'unknown';

        if (err.message && (err.message.includes('load models') || err.message.includes('fetch'))) {
            msg = 'Failed to load AI Models.';
            type = 'network';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = 'Camera access denied.';
            type = 'permission';
        } else {
            msg = err.message || 'Unknown error occurred.';
        }
        
        setErrorMsg(msg);
        setErrorType(type);

        onUpdate({ 
            isLoaded: false, isDetecting: false, mood: Mood.NEUTRAL, 
            score: 0, slouchDetected: false, distracted: false, error: msg 
        });
      }
    };

    const startDetectionLoop = () => {
      intervalId = setInterval(async () => {
        if (videoRef.current && !videoRef.current.paused && !manualMode) {
          const result = await faceService.detect(videoRef.current);
          if (isMounted) {
            onUpdate({
              isLoaded: true,
              isDetecting: true,
              mood: result.mood || Mood.NEUTRAL,
              score: result.score || 0,
              slouchDetected: !!result.slouchDetected,
              distracted: !!result.distracted,
              debug: result.debug
            });
          }
        }
      }, 500); // Increased frequency to 500ms for better responsiveness
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (intervalId) clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryTrigger, manualMode]);

  // Manual Mode Updater
  const updateManual = (updates: Partial<typeof manualState>) => {
      const newState = { ...manualState, ...updates };
      setManualState(newState);
      onUpdate({
          isLoaded: true,
          isDetecting: true,
          mood: newState.mood,
          score: 1, // Mock confidence
          slouchDetected: newState.slouchDetected,
          distracted: newState.distracted,
          debug: { expressions: {}, heuristics: { blinkRate: 0, smileCurvature: 0, mouthOpenness: 0, browLowering: 0, gazeAwayCount: 0, eyeOpenness: 1 } }
      });
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-black shadow-lg border border-slate-700 w-full max-w-[320px] mx-auto aspect-video">
      {/* Video Element - Hidden in manual mode or error */}
      {!manualMode && (
          <video 
            ref={videoRef} 
            muted 
            playsInline 
            className={`w-full h-full object-cover transform scale-x-[-1] ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
          />
      )}
      
      {/* Loading Overlay */}
      {isInitializing && !manualMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-cyan-400 z-20 p-4 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" />
          <span className="text-xs font-bold tracking-wide uppercase mb-2">{loadingStage}</span>
          
          {/* Progress Bar */}
          <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500 ease-out" 
              style={{ width: loadingStage.includes('(1/2)') ? '50%' : '90%' }}
            />
          </div>
        </div>
      )}

      {/* Error / Permission Denied Overlay */}
      {hasPermission === false && !isInitializing && !manualMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 z-20 p-4 text-center">
          <AlertTriangle className="w-8 h-8 mb-2 text-red-500" />
          <p className="text-sm font-bold text-red-400 mb-1">{errorMsg}</p>
          
          <div className="text-[10px] text-slate-500 mb-4 max-w-[200px] bg-slate-800/50 p-2 rounded">
            {errorType === 'network' && (
                <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3" />
                    <span>Check internet connection to load AI models.</span>
                </div>
            )}
            {errorType === 'permission' && (
                <div className="flex items-center gap-2">
                    <Video className="w-3 h-3" />
                    <span>Allow camera access in browser address bar.</span>
                </div>
            )}
            {errorType === 'unknown' && <span>Please refresh the page.</span>}
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={() => setRetryTrigger(p => p + 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium border border-slate-600 transition-colors"
             >
                Retry
             </button>
             <button 
                onClick={() => { setManualMode(true); updateManual({}); }} // Init manual
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium text-white transition-colors"
             >
                Use Manual Mode
             </button>
          </div>
        </div>
      )}

      {/* Manual Mode UI */}
      {manualMode && (
        <div className="absolute inset-0 bg-slate-800 flex flex-col p-4 overflow-y-auto z-10 animate-[fadeIn_0.2s_ease-out]">
           <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                 <User className="w-3 h-3" /> Manual Input
              </span>
              <button 
                onClick={() => setManualMode(false)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Try Camera
              </button>
           </div>

           <div className="grid grid-cols-3 gap-2 mb-4">
              {[Mood.FOCUSED, Mood.NEUTRAL, Mood.HAPPY, Mood.TIRED, Mood.STRESSED, Mood.BORED].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateManual({ mood: m })}
                    className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${
                        manualState.mood === m 
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                        : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                     {m}
                  </button>
              ))}
           </div>

           <div className="space-y-2">
               <button
                  onClick={() => updateManual({ slouchDetected: !manualState.slouchDetected })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                      manualState.slouchDetected 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300' 
                      : 'bg-slate-700 border-transparent text-slate-400'
                  }`}
               >
                  <span>Slouching?</span>
                  {manualState.slouchDetected && <CheckCircle2 className="w-3 h-3" />}
               </button>
               <button
                  onClick={() => updateManual({ distracted: !manualState.distracted })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border ${
                      manualState.distracted
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' 
                      : 'bg-slate-700 border-transparent text-slate-400'
                  }`}
               >
                  <span>Distracted?</span>
                  {manualState.distracted && <CheckCircle2 className="w-3 h-3" />}
               </button>
           </div>
        </div>
      )}

      {/* Live Indicator (Only in Camera Mode) */}
      {!manualMode && hasPermission && (
        <div className="absolute bottom-2 right-2 flex gap-2">
            {onCalibrate && (
                <button 
                    onClick={onCalibrate}
                    className="bg-slate-800/80 hover:bg-slate-700 text-xs text-white px-2 py-1 rounded backdrop-blur-sm border border-slate-600 transition-colors"
                >
                    Calibrate
                </button>
            )}
            <div className="flex items-center gap-1 bg-red-500/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white">LIVE</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default WebcamMonitor;