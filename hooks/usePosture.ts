import { useState, useCallback } from 'react';
import { faceService } from '../services/faceService';

/**
 * Hook to manage posture calibration.
 * Provides a method to trigger calibration based on current face position.
 */
export const usePosture = () => {
  // State to trigger UI feedback (e.g., a success flash)
  const [isJustCalibrated, setIsJustCalibrated] = useState(false);

  const calibrate = useCallback(() => {
    const success = faceService.calibrateToCurrent();
    if (success) {
      setIsJustCalibrated(true);
      // Reset the success state after animation duration
      setTimeout(() => setIsJustCalibrated(false), 2000);
    } else {
      console.warn('Posture Calibration failed: No face detected in current frame.');
    }
  }, []);

  return {
    calibrate,
    isCalibrated: isJustCalibrated
  };
};