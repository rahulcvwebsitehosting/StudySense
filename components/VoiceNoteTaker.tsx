
import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, Loader2, AlertCircle, WifiOff, Edit3, FileText } from 'lucide-react';
import { refineNotesWithGemini } from '../services/aiService';

const VoiceNoteTaker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [refinedNotes, setRefinedNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!transcript.trim()) return;
    
    if (navigator.onLine === false) {
        setError("No internet connection. Cannot refine notes.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const notes = await refineNotesWithGemini(transcript);
      setRefinedNotes(notes);
    } catch (error: any) {
      setError(error.message || "Error generating notes. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refinedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Floating Button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 group flex items-center justify-center w-14 h-14 bg-slate-800 rounded-full border border-slate-700 shadow-xl transition-all duration-300 hover:scale-105 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        aria-label="Open AI Note Refiner"
      >
        <div className="absolute left-full ml-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          AI Note Refiner
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity" />
        <Edit3 className="w-6 h-6 text-slate-200 group-hover:text-white z-10" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Note Refiner</h2>
              <p className="text-xs text-slate-400">Paste rough notes, get structured summaries.</p>
            </div>
          </div>
          <button 
            onClick={() => { setIsOpen(false); setError(null); }}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3 text-red-200 text-sm">
              {error.includes('Network') || error.includes('connection') ? (
                 <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                 <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>{error}</div>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Rough Notes
                </span>
            </div>
            
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type or paste your unstructured thoughts here..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 min-h-[150px] text-slate-300 text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
             <button
                onClick={handleRefine}
                disabled={!transcript || isProcessing}
                className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all w-full md:w-auto justify-center"
             >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-current" />}
                {isProcessing ? 'Refining...' : 'Refine with Advanced AI'}
             </button>
          </div>

          {/* Result Section */}
          {refinedNotes && (
            <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
               <div className="flex items-center justify-between border-t border-slate-700/50 pt-6">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI Refined Output
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
               </div>
               <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono shadow-inner">
                  {refinedNotes}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VoiceNoteTaker;
