import { useEffect, useRef } from 'react';
import { DEBUG } from '../utils/debug';
import { WHEEL_ACTIONS } from '../components/Wheel/wheelReducer';

/**
 * Custom hook to manage auto-spin timer functionality.
 * @param {object} options - Configuration options.
 * @param {boolean} options.isAutoSpinActive - Whether auto-spin is active.
 * @param {number|null} options.currentCountdown - Current countdown in seconds (null if not counting).
 * @param {number} options.autoSpinMinutes - Minutes part of auto-spin duration setting.
 * @param {number} options.autoSpinSeconds - Seconds part of auto-spin duration setting.
 * @param {boolean} options.isVisible - Whether the wheel component is currently visible in viewport.
 * @param {function} options.dispatch - Reducer dispatch function.
 */
function useAutoSpinTimer({
  isAutoSpinActive,
  currentCountdown,
  autoSpinMinutes,
  autoSpinSeconds,
  isVisible,
  dispatch
}) {
  const countdownIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const targetEndTimeRef = useRef(null);
  const visibilityChangeRef = useRef(document.hidden);
  const isAutoSpinActiveRef = useRef(isAutoSpinActive);

  // Update refs when props change
  useEffect(() => {
    isAutoSpinActiveRef.current = isAutoSpinActive;
  }, [isAutoSpinActive]);

  // Set up interval for countdown when auto-spin is active
  useEffect(() => {
    // Clean up any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // If auto-spin is not active or countdown is null, don't set up interval
    if (!isAutoSpinActive || currentCountdown === null) {
      // Reset target end time when auto-spin is stopped
      if (!isAutoSpinActive) {
        targetEndTimeRef.current = null;
      }
      return;
    }

    // Initialize target end time when starting countdown
    if (targetEndTimeRef.current === null) {
      lastUpdateTimeRef.current = Date.now();
      targetEndTimeRef.current = lastUpdateTimeRef.current + (currentCountdown * 1000);
      if (DEBUG) console.log(`[useAutoSpinTimer] Starting countdown from ${currentCountdown}s, will end at ${new Date(targetEndTimeRef.current).toLocaleTimeString()}`);
    }

    // Function to update countdown based on current time
    const updateCountdown = () => {
      const now = Date.now();

      // Handle visibility change
      if (document.hidden !== visibilityChangeRef.current) {
        visibilityChangeRef.current = document.hidden;
        
        if (document.hidden) {
          // Tab became hidden, note the time
          lastUpdateTimeRef.current = now;
          if (DEBUG) console.log('[useAutoSpinTimer] Tab hidden, pausing countdown calculation');
        } else {
          // Tab became visible, adjust target end time by the elapsed time
          const elapsedWhileHidden = now - lastUpdateTimeRef.current;
          targetEndTimeRef.current += elapsedWhileHidden;
          lastUpdateTimeRef.current = now;
          if (DEBUG) console.log(`[useAutoSpinTimer] Tab visible, adjusted end time by +${elapsedWhileHidden}ms`);
        }
      }

      // Skip complex updates when tab is hidden to save resources
      if (document.hidden) {
        // Still perform basic checks to maintain functionality
        if (!isAutoSpinActiveRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          return;
        }
        return;
      }

      // Calculate remaining time
      const remainingMs = Math.max(0, targetEndTimeRef.current - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      // Update countdown if changed
      if (remainingSeconds !== currentCountdown) {
        dispatch({ type: WHEEL_ACTIONS.UPDATE_COUNTDOWN, payload: remainingSeconds });
        
        // When countdown reaches zero, trigger auto-spin timer elapsed action
        if (remainingSeconds === 0) {
          if (DEBUG) console.log('[useAutoSpinTimer] Countdown reached zero, triggering auto-spin timer elapsed');
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          targetEndTimeRef.current = null;
          dispatch({ type: WHEEL_ACTIONS.AUTO_SPIN_TIMER_ELAPSED });
        }
      }
    };

    // Update immediately to align with current time
    updateCountdown();
    
    // Set up interval to update every 500ms for smoother countdown
    countdownIntervalRef.current = setInterval(updateCountdown, 500);

    // Clean up interval on unmount or when dependencies change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isAutoSpinActive, currentCountdown, dispatch]);

  // Update target end time when auto-spin timer settings change
  useEffect(() => {
    if (isAutoSpinActive && targetEndTimeRef.current === null) {
      const totalSeconds = (autoSpinMinutes * 60) + autoSpinSeconds;
      lastUpdateTimeRef.current = Date.now();
      targetEndTimeRef.current = lastUpdateTimeRef.current + (totalSeconds * 1000);
      if (DEBUG) console.log(`[useAutoSpinTimer] Set target end time based on new settings: ${autoSpinMinutes}m ${autoSpinSeconds}s`);
    }
  }, [isAutoSpinActive, autoSpinMinutes, autoSpinSeconds]);

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isAutoSpinActiveRef.current) return;
      
      const now = Date.now();
      if (document.hidden) {
        // Tab became hidden, save the time
        lastUpdateTimeRef.current = now;
      } else {
        // Tab became visible, adjust the target end time
        if (lastUpdateTimeRef.current) {
          const elapsedWhileHidden = now - lastUpdateTimeRef.current;
          if (targetEndTimeRef.current) {
            targetEndTimeRef.current += elapsedWhileHidden;
          }
        }
        lastUpdateTimeRef.current = now;
      }
      
      visibilityChangeRef.current = document.hidden;
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Reset on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);
}

export default useAutoSpinTimer; 