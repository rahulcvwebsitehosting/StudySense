import { Mood } from '../types';

export interface MoodHeuristics {
  smileCurvature: number; // 0 to 1
  mouthOpenness: number; // 0 to 1
  blinkRate: number; // blinks per minute (averaged over 30s)
  gazeAwayCount: number; // normalized 0-1 (samples looked away / total samples)
  browLowering: number; // 0 to 1 (1 = very lowered/furrowed)
  eyeOpenness: number; // 0 to 1 (1 = open)
}

export const THRESHOLDS = {
  HAPPY_EXP: 0.4, // Lowered from 0.6 to detect subtle smiles
  SMILE_CURVE: 0.15, // Lowered to be more sensitive
  SURPRISED_EXP: 0.5,
  SAD_EXP: 0.4,
  TIRED_BLINK_RATE: 40, 
  TIRED_EYE_OPENNESS: 0.30,
  FRUSTRATED_ANGRY_EXP: 0.4,
  FRUSTRATED_BROW: 0.35, 
  STRESSED_FEAR_EXP: 0.4,
  BORED_GAZE: 0.3,
  NEUTRAL_EXP: 0.3,
  FOCUS_MIN_NEUTRAL: 0.3,
};

/**
 * Deterministically maps expressions and heuristics to a Mood.
 */
export function mapExpressionsToMood(
  expressions: Record<string, number>,
  heuristics: MoodHeuristics
): Mood {
  const { happy, surprised, sad, angry, fearful, disgusted, neutral } = expressions;
  const { blinkRate, mouthOpenness, smileCurvature, browLowering, gazeAwayCount, eyeOpenness } = heuristics;

  // 1. Happy (High Priority)
  // If expressions say happy, or if there is a decent smile curve with some happy probability
  if (happy >= THRESHOLDS.HAPPY_EXP || (happy > 0.2 && smileCurvature >= THRESHOLDS.SMILE_CURVE)) {
    return Mood.HAPPY;
  }

  // 2. Surprised
  if (surprised >= THRESHOLDS.SURPRISED_EXP) {
    return Mood.SURPRISED;
  }

  // 3. Stressed / Fearful
  if (fearful >= THRESHOLDS.STRESSED_FEAR_EXP) {
    return Mood.STRESSED;
  }

  // 4. Frustrated
  if (angry >= THRESHOLDS.FRUSTRATED_ANGRY_EXP || (angry > 0.3 && browLowering > THRESHOLDS.FRUSTRATED_BROW)) {
    return Mood.FRUSTRATED;
  }

  // 5. Sad
  if (sad >= THRESHOLDS.SAD_EXP) {
    return Mood.SAD;
  }

  // 6. Tired / Drowsy
  // Checks blink rate or consistently low eye openness
  if (blinkRate > THRESHOLDS.TIRED_BLINK_RATE || (eyeOpenness < THRESHOLDS.TIRED_EYE_OPENNESS && eyeOpenness > 0.05)) {
    return Mood.TIRED;
  }

  // 7. Bored
  // Looking away frequently or showing disgust (often confused with boredom/grimace)
  if (gazeAwayCount > THRESHOLDS.BORED_GAZE || (disgusted > 0.4 && neutral > 0.2)) {
    return Mood.BORED;
  }

  // 8. Focused vs Neutral
  // Focus is: Looking at screen + Stable Blink + Neutral-ish expression
  const isLookingAtScreen = gazeAwayCount < 0.15;
  const isStableBlink = blinkRate < 35;
  
  // "Concentration Face": Slight brow furrowing (low anger) or pure neutral
  const isConcentrating = (angry > 0.05 && angry < 0.4) || (browLowering > 0.1);

  if (isLookingAtScreen) {
    if (isConcentrating && isStableBlink && happy < 0.2) {
       return Mood.FOCUSED;
    }
    
    if (neutral >= THRESHOLDS.NEUTRAL_EXP && isStableBlink) {
      return Mood.FOCUSED; // Default to focused if just staring at screen calmly
    }
  }

  // 9. Default Fallback
  if (neutral > 0.3) {
      return Mood.NEUTRAL;
  }

  // Fallback: Max expression if nothing else triggered
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  switch (top) {
    case 'happy': return Mood.HAPPY;
    case 'sad': return Mood.SAD;
    case 'angry': return Mood.FRUSTRATED;
    case 'fearful': return Mood.STRESSED;
    case 'disgusted': return Mood.BORED;
    case 'surprised': return Mood.SURPRISED;
    default: return Mood.NEUTRAL;
  }
}