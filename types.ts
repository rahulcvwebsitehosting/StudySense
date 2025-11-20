
export enum Mood {
  FOCUSED = 'FOCUSED',
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  STRESSED = 'STRESSED',
  TIRED = 'TIRED',
  BORED = 'BORED',
  SAD = 'SAD',
  FRUSTRATED = 'FRUSTRATED',
  SURPRISED = 'SURPRISED',
}

export interface SessionMetric {
  timestamp: number;
  mood: Mood;
  isSlouching: boolean;
  isDistracted: boolean;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  totalDuration: number; // in seconds
  focusTime: number; // in seconds
  distractedTime: number; // in seconds
  postureWarnings: number;
  waterDrank: number;
  moodHistory: SessionMetric[];
  finalFocusScore: number;
}

export interface FaceDetectionState {
  isLoaded: boolean;
  isDetecting: boolean;
  mood: Mood;
  score: number; // Confidence
  slouchDetected: boolean;
  distracted: boolean;
  error?: string;
  // Debug metrics
  debug?: {
    expressions: Record<string, number>;
    heuristics: {
      blinkRate: number;
      smileCurvature: number;
      mouthOpenness: number;
      browLowering: number;
      gazeAwayCount: number;
      eyeOpenness: number;
    };
  };
}

export interface CoachingTip {
  id: string;
  text: string;
  category: 'breathing' | 'posture' | 'focus' | 'break';
  moodTriggers: Mood[];
}