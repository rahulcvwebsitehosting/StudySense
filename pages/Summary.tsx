
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, Smile, Frown, Meh, Zap, AlertCircle, Coffee, MessageCircle, Send, Bot, Loader2, TrendingUp, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SessionData, Mood } from '../types';
import { getMoodReflectionFeedback, askStudyTutor } from '../services/aiService';
import { MOOD_COLORS } from '../constants';

// Helper to generate dynamic questions based on stats
const getReflectionQuestion = (mood: string, count: number, percentage: number): string => {
  const m = mood as Mood;
  switch (m) {
    case Mood.HAPPY:
      return `You were happy ${count} times (${percentage}%) — what made you feel that way?`;
    case Mood.SAD:
      return `You seemed sad ${count} times — was it related to a difficult subject?`;
    case Mood.FRUSTRATED:
      return `Frustration detected (${percentage}%) — was a specific topic tricky?`;
    case Mood.STRESSED:
      return `You looked stressed ${count} times — were you feeling time pressure?`;
    case Mood.SURPRISED:
      return `You were surprised ${count} times — what triggered that?`;
    case Mood.BORED:
      return `Boredom crept in (${percentage}%) — was the material too easy or unengaging?`;
    case Mood.TIRED:
      return `You seemed tired ${count} times — have you been resting enough?`;
    case Mood.FOCUSED:
      return `Great focus! You were in the zone for ${percentage}% of the time. What helped?`;
    case Mood.NEUTRAL:
      return `You were mostly neutral (${percentage}%) — was the session steady and calm?`;
    default:
      return `You felt ${mood.toLowerCase()} often — any specific reason?`;
  }
};

const MOOD_ICONS: Record<Mood, React.ReactNode> = {
  [Mood.HAPPY]: <Smile className="w-5 h-5" />,
  [Mood.SAD]: <Frown className="w-5 h-5" />,
  [Mood.FRUSTRATED]: <AlertCircle className="w-5 h-5" />,
  [Mood.STRESSED]: <Zap className="w-5 h-5" />,
  [Mood.SURPRISED]: <AlertCircle className="w-5 h-5" />,
  [Mood.BORED]: <Meh className="w-5 h-5" />,
  [Mood.TIRED]: <Coffee className="w-5 h-5" />,
  [Mood.FOCUSED]: <Zap className="w-5 h-5" />,
  [Mood.NEUTRAL]: <Meh className="w-5 h-5" />,
};

interface EmotionStat {
    count: number;
    percentage: number;
    longestStreakSecs: number;
}

const Summary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session as SessionData | undefined;

  // State for Analysis
  const [moodStats, setMoodStats] = useState<Record<string, EmotionStat>>({});
  
  // State for Reflection
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<string | null>(null);

  // State for Tutor
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  useEffect(() => {
    if (session) {
      // 1. Aggregate Counts & Streaks from FULL history
      const stats: Record<string, EmotionStat> = {};
      const totalSamples = session.moodHistory.length || 1;

      // Helper to init stat object
      const getStat = (m: string) => {
        if (!stats[m]) {
            stats[m] = { count: 0, percentage: 0, longestStreakSecs: 0 };
        }
        return stats[m];
      };

      let currentStreakMood = '';
      let currentStreakLen = 0;

      session.moodHistory.forEach((m, idx) => {
        // Update Count
        const stat = getStat(m.mood);
        stat.count += 1;

        // Update Streak
        if (m.mood === currentStreakMood) {
            currentStreakLen++;
        } else {
            // Commit previous streak
            if (currentStreakMood) {
                const prevStat = getStat(currentStreakMood);
                if (currentStreakLen > prevStat.longestStreakSecs) {
                    prevStat.longestStreakSecs = currentStreakLen;
                }
            }
            // Start new streak
            currentStreakMood = m.mood;
            currentStreakLen = 1;
        }

        // Commit very last streak at end of loop
        if (idx === session.moodHistory.length - 1 && currentStreakMood) {
            const finalStat = getStat(currentStreakMood);
            if (currentStreakLen > finalStat.longestStreakSecs) {
                finalStat.longestStreakSecs = currentStreakLen;
            }
        }
      });

      // Calculate Percentages
      Object.keys(stats).forEach(k => {
          stats[k].percentage = Math.round((stats[k].count / totalSamples) * 100);
      });

      setMoodStats(stats);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">No Session Data Found</h2>
        <Link to="/" className="text-cyan-400 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Adaptive Chart Sampling: Aim for ~50 points max to keep chart readable
  const sampleRate = Math.max(1, Math.floor(session.moodHistory.length / 50));
  const chartData = session.moodHistory
    .filter((_, i) => i % sampleRate === 0) 
    .map((m, i) => ({
        time: formatTime(i * sampleRate),
        "Mood Score": moodToScore(m.mood),
        moodName: m.mood,
  }));

  function moodToScore(mood: Mood): number {
    switch (mood) {
      case Mood.FOCUSED: return 100;
      case Mood.HAPPY: return 90;
      case Mood.SURPRISED: return 85;
      case Mood.NEUTRAL: return 70;
      case Mood.TIRED: return 50;
      case Mood.BORED: return 40;
      case Mood.SAD: return 30;
      case Mood.FRUSTRATED: return 25;
      case Mood.STRESSED: return 20;
      default: return 50;
    }
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  const handleReflectionSubmit = async (mood: string) => {
    const answer = reflections[mood];
    if (!answer?.trim()) return;

    setLoadingFeedback(mood);
    try {
      const feedback = await getMoodReflectionFeedback(mood, answer);
      setAiFeedback(prev => ({ ...prev, [mood]: feedback }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFeedback(null);
    }
  };

  const handleTutorSubmit = async () => {
    if (!tutorQuery.trim()) return;
    setIsTutorLoading(true);
    
    const context = `
      Session Duration: ${formatTime(session.totalDuration)}
      Focus Score: ${session.finalFocusScore}/100
      Primary Emotions: ${Object.entries(moodStats)
         .sort(([,a], [,b]) => (b as EmotionStat).count - (a as EmotionStat).count)
         .slice(0,3)
         .map(([m, s]) => `${m} (${(s as EmotionStat).percentage}%)`)
         .join(', ')}
      User Reflections: ${Object.entries(reflections).map(([m, r]) => `${m}: "${r}"`).join('; ')}
    `;

    try {
        const answer = await askStudyTutor(tutorQuery, context);
        setTutorResponse(answer);
    } catch (e) {
        console.error(e);
        setTutorResponse("Sorry, I had trouble connecting to the knowledge base.");
    } finally {
        setIsTutorLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-white">Session Summary</h1>
      </div>

      {/* Main Score Card */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border-t border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
        
        <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full shadow-xl mb-6 border border-slate-700">
          <Award className="w-8 h-8 text-yellow-400" />
        </div>
        
        <h2 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">Focus Score</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
          {session.finalFocusScore}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
             <div className="text-slate-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
             <div className="text-xl font-bold text-white">{formatTime(session.totalDuration)}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
             <div className="text-slate-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Focused</div>
             <div className="text-xl font-bold text-emerald-400">{formatTime(session.focusTime)}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
             <div className="text-slate-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> Slouches</div>
             <div className="text-xl font-bold text-orange-400">{session.postureWarnings}</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
             <div className="text-slate-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><Coffee className="w-3 h-3" /> Water</div>
             <div className="text-xl font-bold text-cyan-400">{session.waterDrank} cups</div>
          </div>
        </div>
      </div>

      {/* Mood Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Chart */}
         <div className="glass-panel p-6 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <Activity className="w-5 h-5 text-cyan-400" />
                 <h3 className="text-lg font-bold text-white">Focus Flow</h3>
              </div>
              <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Timeline</div>
            </div>
            <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px' }}
                    formatter={(value: any) => [value, "Score"]}
                />
                <Area 
                    type="monotone" 
                    dataKey="Mood Score" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMood)" 
                    animationDuration={1500}
                />
                </AreaChart>
            </ResponsiveContainer>
            </div>
         </div>

         {/* Counts & Analysis */}
         <div className="glass-panel p-6 rounded-2xl border border-slate-700/50">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <Smile className="w-5 h-5 text-purple-400" /> Emotion Analysis
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {Object.entries(moodStats)
                    .sort(([,a], [,b]) => (b as EmotionStat).count - (a as EmotionStat).count)
                    .map(([mood, stat]) => {
                     const s = stat as EmotionStat;
                     return (
                     <div key={mood} className="flex flex-col items-center justify-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-colors min-h-[100px]">
                         {/* Percentage Bar BG */}
                         <div className="absolute bottom-0 left-0 h-1 bg-slate-700 w-full">
                            <div className={`h-full ${MOOD_COLORS[mood as Mood]?.replace('text-', 'bg-') || 'bg-slate-500'}`} style={{ width: `${s.percentage}%` }} />
                         </div>

                         <div className={`mb-2 p-1.5 rounded-full bg-slate-900 ${MOOD_COLORS[mood as Mood] || 'text-slate-400'}`}>
                             {MOOD_ICONS[mood as Mood] || <Smile className="w-5 h-5"/>}
                         </div>
                         <div className="text-xl font-bold text-white">{s.percentage}%</div>
                         <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">{mood}</div>
                         <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> {s.longestStreakSecs}s
                         </div>
                     </div>
                 )})}
                 {Object.keys(moodStats).length === 0 && (
                    <div className="col-span-full text-center text-slate-500 text-sm py-8 italic">
                        No significant emotion data collected.
                    </div>
                 )}
             </div>
         </div>
      </div>

      {/* Reflection Section */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white">AI Reflection</h3>
                  <p className="text-slate-400 text-sm">Insights based on your {formatTime(session.totalDuration)} session.</p>
              </div>
          </div>
          
          <div className="space-y-8">
             {Object.entries(moodStats)
                .sort(([,a], [,b]) => (b as EmotionStat).count - (a as EmotionStat).count)
                .slice(0, 3) // Top 3 emotions
                .map(([mood, stat]) => {
                 const s = stat as EmotionStat;
                 return (
                 <div key={mood} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`mt-1 p-2 rounded-full bg-slate-900 border border-slate-700 ${MOOD_COLORS[mood as Mood]}`}>
                            {MOOD_ICONS[mood as Mood]}
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-slate-200 mb-1">
                                {getReflectionQuestion(mood, s.count, s.percentage)}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wide">
                                <span>Count: {s.count}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span>Peak Streak: {s.longestStreakSecs}s</span>
                            </div>
                        </div>
                    </div>

                    {!aiFeedback[mood] ? (
                        <div className="pl-14">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="I felt this way because..."
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                    value={reflections[mood] || ''}
                                    onChange={(e) => setReflections({...reflections, [mood]: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReflectionSubmit(mood)}
                                />
                                <button 
                                    onClick={() => handleReflectionSubmit(mood)}
                                    disabled={!reflections[mood] || loadingFeedback === mood}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-purple-900/20"
                                >
                                    {loadingFeedback === mood ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pl-14 animate-[fadeIn_0.5s_ease-out]">
                             <div className="bg-gradient-to-r from-purple-900/20 to-slate-900/20 border border-purple-500/30 rounded-xl p-4 text-slate-200 text-sm flex gap-3">
                                <Bot className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="text-xs text-purple-400 font-bold uppercase mb-1">StudySense Coach</div>
                                    <p className="leading-relaxed">{aiFeedback[mood]}</p>
                                </div>
                             </div>
                        </div>
                    )}
                 </div>
             )})}
             {Object.keys(moodStats).length === 0 && (
                <div className="text-slate-500 text-center italic py-4">
                   Start a longer session to generate reflection insights.
                </div>
             )}
          </div>
      </div>

      {/* AI Study Tutor Section */}
      <div className="glass-panel p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-slate-800/80 to-slate-900/80 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Bot className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">AI Study Assistant</h3>
                    <p className="text-slate-400 text-sm">I have context on your session. Ask me anything.</p>
                </div>
             </div>
          </div>

          <div className="space-y-6 relative z-10">
             <div className="relative">
                 <textarea
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    placeholder="e.g. I was frustrated with Calculus concepts, can you explain limits in simple terms?"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl p-5 pr-14 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors min-h-[100px] resize-none text-sm leading-relaxed"
                 />
                 <button 
                    onClick={handleTutorSubmit}
                    disabled={!tutorQuery || isTutorLoading}
                    className="absolute bottom-4 right-4 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/20"
                 >
                    {isTutorLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                 </button>
             </div>

             {tutorResponse && (
                 <div className="bg-slate-800 rounded-2xl p-6 border-l-4 border-cyan-500 animate-[fadeIn_0.5s_ease-out] shadow-xl">
                     <h4 className="text-sm font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4" /> Answer
                     </h4>
                     <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {tutorResponse}
                     </div>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default Summary;
