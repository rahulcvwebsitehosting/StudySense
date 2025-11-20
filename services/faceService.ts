import { Mood, FaceDetectionState } from '../types';
import { MODEL_URL } from '../constants';
import { mapExpressionsToMood, MoodHeuristics } from '../lib/moodMap';

// Remove declaration of global const to force usage via window object
// declare const faceapi: any;

// Helper to wait for the script to load
const waitForFaceApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).faceapi) {
      resolve();
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).faceapi) {
        clearInterval(interval);
        resolve();
      } else if (attempts > 100) { // Wait up to 10 seconds
        clearInterval(interval);
        reject(new Error("FaceAPI script failed to load. Please refresh or check your connection."));
      }
    }, 100);
  });
};

class FaceService {
  private baselineNoseY: number | null = null;
  private baselineFaceHeight: number | null = null;
  
  private lastNoseY: number | null = null; 
  private lastFaceHeight: number | null = null;

  private isModelsLoaded = false;
  
  // Heuristics State
  private blinkTimestamps: number[] = []; 
  private lastEyeAspectRatio = 0;
  private gazeAwayWindow: boolean[] = []; 

  async loadModels() {
    if (this.isModelsLoaded) return;

    try {
      // Ensure global script is ready
      await waitForFaceApi();
      const faceapi = (window as any).faceapi;

      console.log("Loading FaceAPI models from:", MODEL_URL);

      // Load models from the specified URL (CDN)
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceExpressionModel(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      
      this.isModelsLoaded = true;
      console.log('FaceAPI models loaded successfully');
    } catch (error: any) {
      console.error('Failed to load models:', error);
      throw new Error(`AI Engine Error: ${error.message || 'Failed to load models'}`);
    }
  }

  /**
   * Sets the baseline posture metrics.
   * @param noseY Normalized Y position (0.0 - 1.0)
   * @param faceHeight Normalized face height (0.0 - 1.0) relative to frame
   */
  calibratePosture(noseY: number, faceHeight: number) {
    this.baselineNoseY = noseY;
    this.baselineFaceHeight = faceHeight;
    console.log(`Posture calibrated. BaselineY: ${noseY.toFixed(3)}, Height: ${faceHeight.toFixed(3)}`);
  }

  /**
   * Calibrates posture using the most recently detected face metrics.
   * @returns boolean indicating success
   */
  calibrateToCurrent(): boolean {
    if (this.lastNoseY !== null && this.lastFaceHeight !== null) {
      this.calibratePosture(this.lastNoseY, this.lastFaceHeight);
      return true;
    } else {
      console.warn("Cannot calibrate: No face detected yet.");
      return false;
    }
  }

  private getEyeAspectRatio(eyePoints: any[]): number {
    // EAR formula: (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    const p2_p6 = Math.abs(eyePoints[1].y - eyePoints[5].y);
    const p3_p5 = Math.abs(eyePoints[2].y - eyePoints[4].y);
    const p1_p4 = Math.abs(eyePoints[0].x - eyePoints[3].x);
    if (p1_p4 === 0) return 0;
    return (p2_p6 + p3_p5) / (2.0 * p1_p4);
  }

  private updateBlinkRate(landmarks: any): number {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const leftEAR = this.getEyeAspectRatio(leftEye);
    const rightEAR = this.getEyeAspectRatio(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Threshold for a blink. If EAR drops below ~0.25, eyes are closed.
    const BLINK_THRESHOLD = 0.25;
    
    if (avgEAR < BLINK_THRESHOLD && this.lastEyeAspectRatio >= BLINK_THRESHOLD) {
      this.blinkTimestamps.push(Date.now());
    }
    this.lastEyeAspectRatio = avgEAR;

    // Keep blinks from the last 30 seconds
    const now = Date.now();
    this.blinkTimestamps = this.blinkTimestamps.filter(t => now - t < 30000);

    // Convert to Blinks Per Minute (count in 30s * 2)
    return this.blinkTimestamps.length * 2;
  }

  private calculateMouthOpenness(landmarks: any): number {
    const mouth = landmarks.getMouth();
    // Points: 14 (top inner) and 18 (bottom inner) for openness
    // Or 3 (top outer) and 9 (bottom outer)
    const upper = mouth[14] || mouth[3];
    const lower = mouth[18] || mouth[9];
    if (!upper || !lower) return 0;
    
    const dist = Math.abs(lower.y - upper.y);
    const faceHeight = Math.abs(landmarks.positions[8].y - landmarks.positions[27].y); 
    // Return ratio relative to face height
    return dist / faceHeight;
  }

  private calculateBrowLowering(landmarks: any): number {
    const leftBrow = landmarks.getLeftEyeBrow()[2]; 
    const leftEye = landmarks.getLeftEye()[1]; 
    
    const dist = Math.abs(leftEye.y - leftBrow.y);
    const faceHeight = Math.abs(landmarks.positions[8].y - landmarks.positions[27].y);
    
    const ratio = dist / faceHeight;
    // If ratio is small, brow is low. 
    // Invert so higher number = more lowering (more furrowed)
    return Math.max(0, Math.min(1, (0.1 - ratio) * 10)); 
  }

  private updateGazeHistory(isDistracted: boolean): number {
    this.gazeAwayWindow.push(isDistracted);
    if (this.gazeAwayWindow.length > 30) this.gazeAwayWindow.shift();
    const awayCount = this.gazeAwayWindow.filter(v => v).length;
    return awayCount / this.gazeAwayWindow.length;
  }

  async detect(video: HTMLVideoElement): Promise<Partial<FaceDetectionState>> {
    const faceapi = (window as any).faceapi;
    if (!faceapi || !this.isModelsLoaded || video.paused || video.ended || !video.videoHeight) return {};

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    
    try {
      const detection = await faceapi
        .detectSingleFace(video, options)
        .withFaceLandmarks() 
        .withFaceExpressions();

      if (!detection) {
        const gazeRatio = this.updateGazeHistory(true);
        return {
          distracted: true,
          isDetecting: true,
          debug: {
            expressions: {},
            heuristics: { 
              blinkRate: 0, 
              smileCurvature: 0, 
              mouthOpenness: 0, 
              browLowering: 0,
              gazeAwayCount: gazeRatio,
              eyeOpenness: 0
            }
          }
        };
      }

      // --- Metrics Calculation ---
      const blinkRate = this.updateBlinkRate(detection.landmarks);
      const mouthOpenness = this.calculateMouthOpenness(detection.landmarks);
      const browLowering = this.calculateBrowLowering(detection.landmarks);
      const gazeRatio = this.updateGazeHistory(false);
      
      // Improved Smile Calculation
      const mouth = detection.landmarks.getMouth();
      const leftCorner = mouth[0];
      const rightCorner = mouth[6];
      const avgCornerY = (leftCorner.y + rightCorner.y) / 2;
      // Use top lip (point 3) or bottom lip (point 9) for reference?
      // Usually smile raises corners relative to center. 
      // Let's compare average corner Y to the upper lip center Y (point 14).
      const upperLipCenter = mouth[14]; 
      
      // If corners are higher (smaller Y) than upper lip center, it's likely a smile
      // But neutral mouths often have corners lower than upper lip.
      // Let's measure distance. Negative means corners are above center (smile).
      // Normalizing:
      const boxHeight = detection.detection.box.height;
      
      // Traditional approach: distance between corners vs distance to bottom lip
      // Better heuristic: simple ratio of mouth width to face width + expression
      // Let's stick to the simple depth check for now but refine it.
      const bottomLipCenter = mouth[9]; 
      // Smile Depth: Distance from bottom lip to avg corner height
      // When smiling, mouth widens and corners go up.
      const smileDepth = bottomLipCenter.y - avgCornerY;
      const smileCurvature = smileDepth / boxHeight;

      const heuristics: MoodHeuristics = {
        blinkRate,
        mouthOpenness,
        smileCurvature,
        browLowering,
        gazeAwayCount: gazeRatio,
        eyeOpenness: this.lastEyeAspectRatio // Current EAR
      };

      const mood = mapExpressionsToMood(detection.expressions, heuristics);

      // --- Posture Logic ---
      const nose = detection.landmarks.positions[30];
      
      const normalizedY = nose.y / video.videoHeight;
      const normalizedFaceHeight = boxHeight / video.videoHeight;
      
      // Store for calibration
      this.lastNoseY = normalizedY;
      this.lastFaceHeight = normalizedFaceHeight;

      let isSlouching = false;

      if (this.baselineNoseY === null || this.baselineFaceHeight === null) {
        // Auto-calibrate on first detect if missing
        this.calibratePosture(normalizedY, normalizedFaceHeight);
      } else {
        // Dynamic Threshold Logic:
        // We allow the nose to drop by X% of the face height before flagging slouch.
        // Using 25% of the face height as the buffer. 
        // This makes it relative to how close the user is sitting.
        const dynamicThreshold = this.baselineFaceHeight * 0.25; 
        
        if (normalizedY > (this.baselineNoseY + dynamicThreshold)) {
          isSlouching = true;
        }
      }

      return {
        distracted: false,
        mood,
        slouchDetected: isSlouching,
        score: detection.detection.score,
        isDetecting: true,
        debug: {
          expressions: detection.expressions,
          heuristics
        }
      };
    } catch (err) {
      console.warn("Detection frame skipped", err);
      return {};
    }
  }
}

export const faceService = new FaceService();