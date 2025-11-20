
import { SessionData } from '../types';

const STORAGE_KEY = 'studysense_sessions';
const EVENT_KEY = 'studysense:session-updated';

export const getStoredSessions = (): SessionData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load sessions', e);
    return [];
  }
};

export const saveSession = (session: SessionData) => {
  try {
    const current = getStoredSessions();
    const updated = [session, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Emit update event for UI refresh
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const subscribeToSessions = (callback: () => void) => {
  window.addEventListener(EVENT_KEY, callback);
  return () => window.removeEventListener(EVENT_KEY, callback);
};

export const getDashboardStats = () => {
  const sessions = getStoredSessions();
  
  const totalFocusTime = sessions.reduce((acc, s) => acc + s.focusTime, 0);
  const totalSessions = sessions.length;
  
  // Average focus score of last 5 sessions
  const recentSessions = sessions.slice(0, 5);
  const avgScore = recentSessions.length 
    ? Math.round(recentSessions.reduce((acc, s) => acc + s.finalFocusScore, 0) / recentSessions.length)
    : 0;

  return {
    totalFocusTime,
    totalSessions,
    avgScore,
    recentSessions
  };
};
