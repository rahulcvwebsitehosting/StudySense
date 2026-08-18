
import { CoachingTip, Mood } from './types';

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.FOCUSED]: 'text-emerald-400',
  [Mood.HAPPY]: 'text-yellow-400',
  [Mood.NEUTRAL]: 'text-blue-400',
  [Mood.STRESSED]: 'text-red-500',
  [Mood.TIRED]: 'text-purple-400',
  [Mood.BORED]: 'text-gray-400',
  [Mood.SAD]: 'text-indigo-400',
  [Mood.FRUSTRATED]: 'text-orange-500',
  [Mood.SURPRISED]: 'text-pink-400',
};

export const COACHING_TIPS: CoachingTip[] = [
  { id: '1', text: 'Take 3 deep breaths to reset your focus.', category: 'breathing', moodTriggers: [Mood.STRESSED, Mood.FRUSTRATED] },
  { id: '2', text: 'Your shoulders look tense. Roll them back.', category: 'posture', moodTriggers: [Mood.STRESSED, Mood.TIRED] },
  { id: '3', text: 'Sit up straight to boost your energy.', category: 'posture', moodTriggers: [Mood.TIRED, Mood.BORED, Mood.NEUTRAL] },
  { id: '4', text: 'Great focus! Keep this momentum going.', category: 'focus', moodTriggers: [Mood.FOCUSED] },
  { id: '5', text: 'Eyes feeling heavy? Blink rapidly for 10 seconds.', category: 'break', moodTriggers: [Mood.TIRED, Mood.SAD] },
  { id: '6', text: 'Try the 20-20-20 rule: Look at something 20ft away.', category: 'break', moodTriggers: [Mood.TIRED, Mood.FOCUSED] },
  { id: '7', text: 'You seem distracted. Let\'s do one small task now.', category: 'focus', moodTriggers: [Mood.BORED, Mood.FRUSTRATED] },
  { id: '8', text: 'Hydrate! A sip of water wakes up the brain.', category: 'break', moodTriggers: [Mood.TIRED, Mood.NEUTRAL, Mood.SAD] },
  { id: '9', text: 'Getting frustrated? Take a short walk.', category: 'break', moodTriggers: [Mood.FRUSTRATED] },
  { id: '10', text: 'Channel that energy into your work!', category: 'focus', moodTriggers: [Mood.SURPRISED, Mood.HAPPY] },
];

// Use CDN for instant reliability. 
// To use locally, download weights to public/models and change this back to '/models'
export const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// Thresholds
export const SLOUCH_THRESHOLD_Y = 0.05; // Normalized coordinate shift
export const DISTRACTION_CONFIDENCE_THRESHOLD = 0.85; // If face detection score drops or orientation shifts