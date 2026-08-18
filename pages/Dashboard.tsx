
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Brain, TrendingUp } from 'lucide-react';
import { getDashboardStats, subscribeToSessions } from '../services/storage';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFocusTime: 0,
    totalSessions: 0,
    avgScore: 0,
    recentSessions: [] as any[]
  });

  const loadStats = () => {
    setStats(getDashboardStats());
  };

  useEffect(() => {
    loadStats();
    // Subscribe to storage updates to refresh immediately after a session
    const unsubscribe = subscribeToSessions(loadStats);
    return unsubscribe;
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back.</h1>
          <p className="text-slate-400 max-w-lg">
            Ready to achieve flow state? Your AI coach is initialized and running locally.
          </p>
        </div>
        <button 
          onClick={() => navigate('/session')}
          className="group flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Focus Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Average Focus Score</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats.avgScore}<span className="text-sm text-slate-500 ml-1">/ 100</span></div>
        </div>

        <div className="glass-panel p-6 rounded-2xl group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Total Focus Time</h3>
          </div>
          <div className="text-3xl font-bold text-white">{formatTime(stats.totalFocusTime)}</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Sessions Completed</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSessions}</div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        {stats.recentSessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No sessions yet. Start your first study session to see analytics!
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentSessions.map((session: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all hover:scale-[1.01] border border-transparent hover:border-slate-700 cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-12 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
                  <div>
                    <div className="text-white font-medium">{new Date(session.startTime).toLocaleDateString()}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Duration</div>
                    <div className="font-medium text-slate-200">{formatTime(session.totalDuration)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Score</div>
                    <div className={`font-bold ${session.finalFocusScore >= 80 ? 'text-emerald-400' : session.finalFocusScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {session.finalFocusScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
